import * as fs from "fs";
import * as vscode from "vscode";
import { registerRuleCommands } from "./commands/rule-commands";
import { registerSkillCommands } from "./commands/skill-commands";
import { resolveSystemPaths } from "./core/paths";
import { RulesManager } from "./core/rules-manager";
import { SkillsManager } from "./core/skills-manager";
import { StatusBarManager } from "./status-bar/status-bar-manager";
import { CustomizationWebviewProvider } from "./views/customization-webview-provider";

export function activate(context: vscode.ExtensionContext): void {
    const config = vscode.workspace.getConfiguration("boygr.antigravityCustomizationManager");
    const customAntigravityPath = config.get<string>("customAntigravityPath", "");
    const limitBytes = config.get<number>("ruleFileSizeLimitBytes", 24000);

    let systemPaths = resolveSystemPaths(customAntigravityPath);

    const rulesManager = new RulesManager(systemPaths, limitBytes);
    const skillsManager = new SkillsManager(systemPaths);
    const statusBarManager = new StatusBarManager();
    context.subscriptions.push(statusBarManager);

    const webviewProvider = new CustomizationWebviewProvider(
        context,
        rulesManager,
        skillsManager,
        statusBarManager,
        systemPaths
    );

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            CustomizationWebviewProvider.viewType,
            webviewProvider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
            }
        )
    );

    const refreshAll = () => {
        systemPaths = resolveSystemPaths(
            vscode.workspace
                .getConfiguration("boygr.antigravityCustomizationManager")
                .get<string>("customAntigravityPath", "")
        );
        webviewProvider.updatePaths(systemPaths);
    };

    // Register Rule & Skill commands
    registerRuleCommands(context, rulesManager, systemPaths, refreshAll);
    registerSkillCommands(context, skillsManager, systemPaths, refreshAll);

    // Refresh command
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "boygr.antigravityCustomizationManager.refresh",
            () => {
                refreshAll();
                vscode.window.showInformationMessage("Antigravity rules and skills refreshed.");
            }
        )
    );

    // Focus view command
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "boygr.antigravityCustomizationManager.focusView",
            () => {
                vscode.commands.executeCommand(
                    `${CustomizationWebviewProvider.viewType}.focus`
                );
            }
        )
    );

    // Open settings command
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "boygr.antigravityCustomizationManager.openSettings",
            async () => {
                await webviewProvider.openSettingsModal();
            }
        )
    );

    // File system watcher for live updates when rules or skills are modified
    try {
        const watcher = vscode.workspace.createFileSystemWatcher("**/{.agents,.agent,_agents,_agent}/**");
        watcher.onDidChange(refreshAll);
        watcher.onDidCreate(refreshAll);
        watcher.onDidDelete(refreshAll);
        context.subscriptions.push(watcher);

        const rootRulesWatcher = vscode.workspace.createFileSystemWatcher("**/{AGENTS,GEMINI,CLAUDE,CODEX}.md*");
        rootRulesWatcher.onDidChange(refreshAll);
        rootRulesWatcher.onDidCreate(refreshAll);
        rootRulesWatcher.onDidDelete(refreshAll);
        context.subscriptions.push(rootRulesWatcher);

        const cursorRulesWatcher = vscode.workspace.createFileSystemWatcher("**/.cursorrules");
        cursorRulesWatcher.onDidChange(refreshAll);
        cursorRulesWatcher.onDidCreate(refreshAll);
        cursorRulesWatcher.onDidDelete(refreshAll);
        context.subscriptions.push(cursorRulesWatcher);

        if (fs.existsSync(systemPaths.globalRulesDir)) {
            const globalWatcher = fs.watch(systemPaths.globalRulesDir, (_eventType, filename) => {
                if (filename && (filename.endsWith(".md") || filename.endsWith(".disabled") || filename.endsWith(".mdc"))) {
                    refreshAll();
                }
            });
            context.subscriptions.push({
                dispose: () => {
                    try {
                        globalWatcher.close();
                    } catch {
                        // ignore
                    }
                },
            });
        }
    } catch {
        // Ignore file watcher setup errors
    }

    // React to configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration("boygr.antigravityCustomizationManager")) {
                refreshAll();
            }
        })
    );

    // React to workspace folder changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            refreshAll();
        })
    );

    // Initial load
    refreshAll();
}

export function deactivate(): void {}

