import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { computeBudgetSummary } from "../core/budget-calculator";
import { RULE_TEMPLATES, RulesManager } from "../core/rules-manager";
import { SkillsManager } from "../core/skills-manager";
import {
    CustomizationState,
    LanguagePreference,
    SystemPaths,
    ThemePreference,
    UserPreferences,
} from "../core/types";
import { StatusBarManager } from "../status-bar/status-bar-manager";

export class CustomizationWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "boygr.antigravityCustomizationManager.mainView";
    private view?: vscode.WebviewView;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly rulesManager: RulesManager,
        private readonly skillsManager: SkillsManager,
        private readonly statusBarManager: StatusBarManager,
        private paths: SystemPaths
    ) {}

    public updatePaths(paths: SystemPaths): void {
        this.paths = paths;
        this.rulesManager.updatePaths(paths);
        this.skillsManager.updatePaths(paths);
        this.refresh();
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this.context.extensionPath, "dist", "media")),
                vscode.Uri.file(path.join(this.context.extensionPath, "media")),
            ],
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (message) => {
            try {
                await this.handleMessage(message);
            } catch (err: any) {
                vscode.window.showErrorMessage(`Action failed: ${err.message}`);
                this.postMessage({
                    type: "actionError",
                    message: err.message,
                });
            }
        });

        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                this.refresh();
            }
        });
    }

    public async refresh(): Promise<void> {
        if (!this.view) return;

        const config = vscode.workspace.getConfiguration(
            "boygr.antigravityCustomizationManager"
        );
        const maxBudget = config.get<number>("defaultRulesBudget", 20000);
        const limitBytes = config.get<number>("ruleFileSizeLimitBytes", 24000);
        const showStatus = config.get<boolean>("showStatusBarItem", true);
        const themePref = config.get<ThemePreference>("theme", "vscode");
        const defaultLang = config.get<LanguagePreference>("defaultLanguage", "auto");
        const multiAgentSync = config.get<boolean>("enableMultiAgentSync", true);

        // Resolve effective language
        let effectiveLanguage: "en" | "id" = "en";
        if (defaultLang === "id" || (defaultLang === "auto" && vscode.env.language.startsWith("id"))) {
            effectiveLanguage = "id";
        }

        const prefs: UserPreferences = {
            theme: themePref,
            language: defaultLang,
            effectiveLanguage,
            customAntigravityPath: config.get<string>("customAntigravityPath", ""),
            defaultRulesBudget: maxBudget,
            ruleFileSizeLimitBytes: limitBytes,
            showStatusBarItem: showStatus,
            enableMultiAgentSync: multiAgentSync,
        };

        this.rulesManager.updatePaths(this.paths, limitBytes);
        this.skillsManager.updatePaths(this.paths);

        const rules = await this.rulesManager.loadAllRules();
        const skills = await this.skillsManager.loadAllSkills();
        const budget = computeBudgetSummary(rules, skills, maxBudget, limitBytes);

        // Update status bar
        this.statusBarManager.update(budget, showStatus);

        const state: CustomizationState = {
            rules,
            skills,
            budget,
            paths: this.paths,
            preferences: prefs,
        };

        const meta = {
            version: String(this.context.extension.packageJSON.version ?? "0.1.0"),
            developer: "Boy Gilang Ramadhan (BoyGR)",
            website: "https://boygr.com",
            iconUri: this.view
                ? this.view.webview
                      .asWebviewUri(
                          vscode.Uri.joinPath(
                              this.context.extensionUri,
                              "media",
                              "icon.png"
                          )
                      )
                      .toString()
                : "",
        };

        this.postMessage({
            type: "stateUpdate",
            state,
            meta,
            templates: RULE_TEMPLATES,
        });
    }

    private postMessage(msg: any): void {
        if (this.view) {
            this.view.webview.postMessage(msg);
        }
    }

    private async handleMessage(message: any): Promise<void> {
        switch (message.type) {
            case "ready":
                await this.refresh();
                break;

            case "refresh":
                await this.refresh();
                break;

            case "openFile":
                if (message.filePath && fs.existsSync(message.filePath)) {
                    const doc = await vscode.workspace.openTextDocument(message.filePath);
                    await vscode.window.showTextDocument(doc);
                }
                break;

            case "revealInOS":
                if (message.filePath) {
                    try {
                        if (!fs.existsSync(message.filePath)) {
                            fs.mkdirSync(message.filePath, { recursive: true });
                        }
                        await vscode.commands.executeCommand(
                            "revealFileInOS",
                            vscode.Uri.file(message.filePath)
                        );
                    } catch (err: any) {
                        vscode.window.showErrorMessage(`Failed to open folder: ${err.message}`);
                    }
                }
                break;

            case "toggleRule":
                if (message.filePath) {
                    await this.rulesManager.toggleRule(message.filePath);
                    await this.refresh();
                }
                break;

            case "createRule":
                await this.rulesManager.createRule(
                    message.scope,
                    message.fileName,
                    message.content
                );
                await this.refresh();
                break;

            case "saveRule":
                if (message.filePath && typeof message.content === "string") {
                    await this.rulesManager.saveRuleContent(message.filePath, message.content);
                    await this.refresh();
                }
                break;

            case "deleteRule": {
                const confirmed = await vscode.window.showWarningMessage(
                    `Are you sure you want to delete rule "${path.basename(message.filePath)}"?`,
                    { modal: true },
                    "Delete"
                );
                if (confirmed === "Delete") {
                    await this.rulesManager.deleteRule(message.filePath);
                    await this.refresh();
                }
                break;
            }

            case "renameRule": {
                if (!message.filePath) break;
                const currentFileName = path.basename(message.filePath).replace(/\.disabled$/, "");
                const newName = await vscode.window.showInputBox({
                    prompt: "Enter new file name for the rule",
                    value: currentFileName,
                    validateInput: (val) => {
                        if (!val.trim()) return "Rule file name cannot be empty.";
                        if (/[^a-zA-Z0-9-_.]/.test(val.trim())) {
                            return "Only letters, numbers, hyphens, underscores, and dots are allowed.";
                        }
                        return null;
                    },
                });

                if (newName && newName.trim()) {
                    try {
                        const newPath = await this.rulesManager.renameRule(message.filePath, newName.trim());
                        vscode.window.showInformationMessage(`Rule renamed to "${path.basename(newPath).replace(/\.disabled$/, "")}"`);
                        await this.refresh();
                    } catch (err: any) {
                        vscode.window.showErrorMessage(`Failed to rename rule: ${err.message}`);
                    }
                }
                break;
            }

            case "createSkill":
                await this.skillsManager.createSkill({
                    name: message.name,
                    description: message.description,
                    createScriptsFolder: message.createScriptsFolder,
                    createReferencesFolder: message.createReferencesFolder,
                    createExamplesFolder: message.createExamplesFolder,
                });
                await this.refresh();
                break;

            case "forkSkill": {
                const targetSkillPath = await this.skillsManager.forkToWorkspace(message.sourcePath);
                vscode.window.showInformationMessage(
                    `Skill forked to workspace: ${path.basename(path.dirname(targetSkillPath))}`
                );
                await this.refresh();
                const doc = await vscode.workspace.openTextDocument(targetSkillPath);
                await vscode.window.showTextDocument(doc);
                break;
            }

            case "deleteSkill": {
                const confirmed = await vscode.window.showWarningMessage(
                    `Are you sure you want to delete workspace skill "${path.basename(message.folderPath)}"?`,
                    { modal: true },
                    "Delete Skill"
                );
                if (confirmed === "Delete Skill") {
                    await this.skillsManager.deleteWorkspaceSkill(message.folderPath);
                    await this.refresh();
                }
                break;
            }

            case "exportMultiAgentRule":
                await this.rulesManager.exportMultiAgentRule(
                    message.sourcePath,
                    message.targetAgent
                );
                vscode.window.showInformationMessage(`Rule exported to ${message.targetAgent}!`);
                await this.refresh();
                break;

            case "openExternal":
                if (message.url) {
                    await vscode.env.openExternal(vscode.Uri.parse(message.url));
                }
                break;

            case "openSettings":
                await this.openSettingsModal();
                break;

            case "saveSettings": {
                if (message.settings) {
                    const config = vscode.workspace.getConfiguration("boygr.antigravityCustomizationManager");
                    const s = message.settings;
                    if (typeof s.theme === "string") {
                        await config.update("theme", s.theme, vscode.ConfigurationTarget.Global);
                    }
                    if (typeof s.language === "string") {
                        await config.update("defaultLanguage", s.language, vscode.ConfigurationTarget.Global);
                    }
                    if (typeof s.defaultRulesBudget === "number" && !isNaN(s.defaultRulesBudget)) {
                        await config.update("defaultRulesBudget", s.defaultRulesBudget, vscode.ConfigurationTarget.Global);
                    }
                    if (typeof s.ruleFileSizeLimitBytes === "number" && !isNaN(s.ruleFileSizeLimitBytes)) {
                        await config.update("ruleFileSizeLimitBytes", s.ruleFileSizeLimitBytes, vscode.ConfigurationTarget.Global);
                    }
                    if (typeof s.showStatusBarItem === "boolean") {
                        await config.update("showStatusBarItem", s.showStatusBarItem, vscode.ConfigurationTarget.Global);
                    }
                    if (typeof s.enableMultiAgentSync === "boolean") {
                        await config.update("enableMultiAgentSync", s.enableMultiAgentSync, vscode.ConfigurationTarget.Global);
                    }
                    if (typeof s.customAntigravityPath === "string") {
                        await config.update("customAntigravityPath", s.customAntigravityPath, vscode.ConfigurationTarget.Global);
                    }
                    vscode.window.showInformationMessage("Antigravity Customization Manager settings saved.");
                    await this.refresh();
                }
                break;
            }
        }
    }

    public async openSettingsModal(): Promise<void> {
        if (!this.view) {
            await vscode.commands.executeCommand(
                `${CustomizationWebviewProvider.viewType}.focus`
            );
        }

        if (!this.view) {
            return;
        }

        await this.view.webview.postMessage({
            type: "openSettings",
        });
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const nonce = crypto.randomBytes(16).toString("base64");

        const scriptUri = webview.asWebviewUri(
            vscode.Uri.file(
                path.join(this.context.extensionPath, "dist", "media", "customization-manager.js")
            )
        );

        const styleUri = webview.asWebviewUri(
            vscode.Uri.file(
                path.join(this.context.extensionPath, "dist", "media", "customization-manager.css")
            )
        );

        const iconUri = webview
            .asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "icon.png"))
            .toString();
        const version = String(this.context.extension.packageJSON.version ?? "0.1.0");
        const developer = "Boy Gilang Ramadhan (BoyGR)";
        const website = "https://boygr.com";

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} data: https:; font-src ${webview.cspSource};">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${styleUri}" rel="stylesheet">
    <title>Antigravity Customization Manager</title>
</head>
<body>
    <div class="app-container" data-icon-uri="${iconUri}" data-version="${version}" data-developer="${developer}" data-website="${website}">
        <!-- Top Toolbar Header -->
        <header class="app-header">
            <div class="header-toolbar-row">
                <div class="search-bar">
                    <input type="text" id="search-input" placeholder="Search rules and skills..." />
                </div>
            </div>
            <div class="stats-bar" id="stats-bar">
                <span>Loading customizations...</span>
            </div>
        </header>

        <!-- Navigation Tabs -->
        <nav class="app-tabs">
            <button class="tab-btn active" data-tab="tab-rules" data-i18n="tabRules">Rules</button>
            <button class="tab-btn" data-tab="tab-skills" data-i18n="tabSkills">Skills</button>
            <button class="tab-btn" data-tab="tab-budget" data-i18n="tabBudget">Budget & Health</button>
        </nav>

        <!-- Tab Content Container -->
        <div class="tab-content-area">
            <!-- Tab 1: Rules Content -->
            <main id="tab-rules" class="tab-pane active">
                <div class="action-strip">
                    <div class="action-buttons-group">
                        <button id="btn-new-rule" class="btn btn-primary">
                            <span class="btn-symbol">+</span> <span data-i18n="btnNewRule">New Rule</span>
                        </button>
                        <button id="btn-sync-agents" class="btn btn-secondary" title="Sync to Cursor / Claude / Copilot">
                            <span class="btn-symbol">⇄</span> <span data-i18n="btnSyncAgents">Multi-Agent Sync</span>
                        </button>
                    </div>
                    <select id="rules-scope-filter" class="dropdown-filter" aria-label="Rules Scope Filter">
                        <option value="all" data-i18n="filterAll">All Scopes</option>
                        <option value="workspace" data-i18n="filterWorkspace">Workspace</option>
                        <option value="global" data-i18n="filterGlobal">Global Machine</option>
                    </select>
                </div>
                <div id="rules-list" class="items-container">
                    <div class="skeleton-placeholder">Loading rules...</div>
                </div>
            </main>

            <!-- Tab 2: Skills Content -->
            <main id="tab-skills" class="tab-pane">
                <div class="action-strip">
                    <div class="action-buttons-group">
                        <button id="btn-new-skill" class="btn btn-primary">
                            <span class="btn-symbol">+</span> <span data-i18n="btnNewSkill">New Skill</span>
                        </button>
                        <button id="btn-open-skills-folder" class="btn btn-secondary">
                            <span data-i18n="btnOpenFolder">Open Folder</span>
                        </button>
                    </div>
                    <select id="skills-scope-filter" class="dropdown-filter" aria-label="Skills Tier Filter">
                        <option value="all" data-i18n="filterAll">All Tiers</option>
                        <option value="workspace" data-i18n="filterWorkspace">Workspace</option>
                        <option value="global" data-i18n="filterGlobal">Plugins</option>
                        <option value="builtin" data-i18n="filterBuiltin">Built-in</option>
                    </select>
                </div>
                <div id="skills-list" class="items-container">
                    <div class="skeleton-placeholder">Loading skills...</div>
                </div>
            </main>

            <!-- Tab 3: Budget & Health Diagnostics -->
            <main id="tab-budget" class="tab-pane">
                <div class="diagnostics-container">
                    <!-- Rules Budget Card -->
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title" data-i18n="rulesBudgetTitle">Rules Token Budget</span>
                            <span id="budget-badge" class="badge">Safe</span>
                        </div>
                        <div class="budget-meter-wrap">
                            <div class="budget-meter-bar">
                                <div id="budget-meter-fill" class="budget-meter-fill" style="width: 0%;"></div>
                            </div>
                            <div class="budget-meter-labels">
                                <span id="meter-used">0 tokens</span>
                                <span id="meter-max">20,000 max</span>
                            </div>
                        </div>
                        <p class="metric-hint" data-i18n="budgetHint">
                            Antigravity automatically demotes rules from inline context to path pointers if total active rules exceed 20,000 tokens.
                        </p>
                    </div>

                    <!-- Per-file Cap Card -->
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title" data-i18n="fileCapTitle">Per-File Size Limit (24 KB)</span>
                            <span id="file-limit-badge" class="badge">0 Violations</span>
                        </div>
                        <p class="metric-hint" data-i18n="fileCapHint">
                            Rule files larger than 24,000 bytes are strictly truncated on line boundaries by Antigravity.
                        </p>
                        <div id="file-limit-violations" class="violations-list"></div>
                    </div>

                    <!-- Skills Overview Card -->
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title" data-i18n="skillsOverviewTitle">Skills Progressive Disclosure</span>
                        </div>
                        <div class="stats-grid">
                            <div class="stat-box">
                                <span class="stat-num" id="stat-workspace-skills">0</span>
                                <span class="stat-lbl" data-i18n="statWorkspace">Workspace</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-num" id="stat-plugin-skills">0</span>
                                <span class="stat-lbl" data-i18n="statPlugins">Plugins</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-num" id="stat-builtin-skills">0</span>
                                <span class="stat-lbl" data-i18n="statBuiltin">Built-in</span>
                            </div>
                        </div>
                        <p class="metric-hint" data-i18n="skillsTokensHint">
                            Estimated frontmatter description overhead injected into primary prompt: <strong id="stat-skill-desc-tokens">0</strong> tokens.
                        </p>
                    </div>

                    <!-- Precedence & Precedence Order Reference -->
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title" data-i18n="precedenceTitle">Resolution Precedence Order</span>
                        </div>
                        <ol class="precedence-list">
                            <li><strong>Workspace Project:</strong> <code>.agents/rules</code>, <code>.agents/skills</code>, <code>AGENTS.md</code></li>
                            <li><strong>Declared Configs:</strong> <code>skills.json</code>, <code>plugins.json</code></li>
                            <li><strong>Global Machine:</strong> <code>~/.gemini/config/rules</code></li>
                            <li><strong>Built-in Customizations:</strong> <code>~/.gemini/antigravity/builtin/skills</code></li>
                        </ol>
                    </div>
                </div>
            </main>
        </div>

        <!-- Developer Footer (BoyGR Standard Layout) -->
        <footer class="developer-footer">
            <div class="developer-footer-copy">
                <span class="footer-prefix" data-i18n="developedBy">Developed by</span>
                <a href="${website}" data-external-url="${website}" id="developer-link" class="developer-link" title="${website}">${developer}</a>
            </div>
            <span class="footer-version">v${version}</span>
        </footer>
    </div>

    <!-- Settings Modal Root Container -->
    <div id="settings-modal-root"></div>

    <!-- Modal Dialog Overlay Container -->
    <div id="modal-overlay" class="modal-overlay hidden">
        <div id="modal-box" class="modal-box">
            <div class="modal-header">
                <h3 id="modal-title">Dialog</h3>
                <button id="modal-close-btn" class="modal-close">&times;</button>
            </div>
            <div id="modal-body" class="modal-body"></div>
            <div class="modal-footer" id="modal-footer"></div>
        </div>
    </div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
}

