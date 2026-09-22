import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { RULE_TEMPLATES, RulesManager } from "../core/rules-manager";
import { SystemPaths } from "../core/types";

export function registerRuleCommands(
    context: vscode.ExtensionContext,
    rulesManager: RulesManager,
    paths: SystemPaths,
    onStateChange: () => void
): void {
    // 1. Create Rule Command
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "boygr.antigravityCustomizationManager.createRule",
            async () => {
                const scopePick = await vscode.window.showQuickPick(
                    [
                        {
                            label: "$(folder) Workspace Rule",
                            description: ".agents/rules/ (Project-level rule)",
                            scope: "workspace" as const,
                        },
                        {
                            label: "$(globe) Global Rule",
                            description: "~/.gemini/config/rules/ (Machine-wide rule)",
                            scope: "global" as const,
                        },
                    ],
                    { placeHolder: "Select target scope for the new rule" }
                );

                if (!scopePick) return;

                const templatePick = await vscode.window.showQuickPick(
                    [
                        {
                            label: "$(file) Blank Rule",
                            description: "Start from an empty Markdown document",
                            content: "# Custom Rule\n\nWrite guidelines and constraints here.\n",
                        },
                        ...RULE_TEMPLATES.map((t) => ({
                            label: `$(symbol-keyword) ${t.name}`,
                            description: t.description,
                            content: t.content,
                        })),
                    ],
                    { placeHolder: "Select a rule template or start blank" }
                );

                if (!templatePick) return;

                const fileName = await vscode.window.showInputBox({
                    prompt: "Enter file name for the rule (e.g. coding-guidelines or dev-sop)",
                    placeHolder: "my-custom-rule",
                    validateInput: (val) => {
                        if (!val.trim()) return "Rule file name cannot be empty.";
                        if (/[^a-zA-Z0-9-_.]/.test(val.trim())) {
                            return "Only letters, numbers, hyphens, underscores, and dots are allowed.";
                        }
                        return null;
                    },
                });

                if (!fileName) return;

                try {
                    const createdPath = await rulesManager.createRule(
                        scopePick.scope,
                        fileName,
                        templatePick.content
                    );

                    vscode.window.showInformationMessage(`Rule created: ${fileName}`);
                    onStateChange();

                    const doc = await vscode.workspace.openTextDocument(createdPath);
                    await vscode.window.showTextDocument(doc);
                } catch (err: any) {
                    vscode.window.showErrorMessage(`Failed to create rule: ${err.message}`);
                }
            }
        )
    );

    // 2. Export / Sync Multi-Agent Rules Command
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "boygr.antigravityCustomizationManager.exportMultiAgentRules",
            async () => {
                const rules = await rulesManager.loadAllRules();
                if (rules.length === 0) {
                    vscode.window.showInformationMessage("No active rules found to export.");
                    return;
                }

                const rulePick = await vscode.window.showQuickPick(
                    rules.map((r) => ({
                        label: `$(file-text) ${r.name}`,
                        description: `[${r.scope}] ${r.title}`,
                        rulePath: r.filePath,
                    })),
                    { placeHolder: "Select rule to sync/export to other agents" }
                );

                if (!rulePick) return;

                const targetPick = await vscode.window.showQuickPick(
                    [
                        {
                            label: "$(sync) AGENTS.md (Universal Standard - Antigravity & Codex)",
                            description: "Root of workspace (universal standard for Antigravity, Codex, etc.)",
                            target: "agents-md" as const,
                        },
                        {
                            label: "$(sync) CODEX.md (OpenAI Codex)",
                            description: "Root of workspace (dedicated Codex CLI instructions)",
                            target: "codex-md" as const,
                        },
                        {
                            label: "$(sync) .cursorrules (Cursor)",
                            description: "Root of workspace (Cursor AI IDE rules)",
                            target: "cursorrules" as const,
                        },
                        {
                            label: "$(sync) CLAUDE.md (Claude Code)",
                            description: "Root of workspace (Claude Code CLI guidelines)",
                            target: "claude-md" as const,
                        },
                        {
                            label: "$(sync) .github/copilot-instructions.md (Copilot)",
                            description: ".github/ folder (GitHub Copilot workspace instructions)",
                            target: "copilot-instructions" as const,
                        },
                    ],
                    { placeHolder: "Select target agent format" }
                );

                if (!targetPick) return;

                try {
                    const dest = await rulesManager.exportMultiAgentRule(
                        rulePick.rulePath,
                        targetPick.target
                    );
                    vscode.window.showInformationMessage(
                        `Rule synced successfully to ${dest}!`
                    );
                    onStateChange();

                    const doc = await vscode.workspace.openTextDocument(dest);
                    await vscode.window.showTextDocument(doc);
                } catch (err: any) {
                    vscode.window.showErrorMessage(`Export failed: ${err.message}`);
                }
            }
        )
    );

    // 3. Open Global Rules Folder
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "boygr.antigravityCustomizationManager.openGlobalRulesFolder",
            async () => {
                if (!fs.existsSync(paths.globalRulesDir)) {
                    fs.mkdirSync(paths.globalRulesDir, { recursive: true });
                }
                await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(paths.globalRulesDir));
            }
        )
    );

    // 4. Open Workspace Rules Folder
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "boygr.antigravityCustomizationManager.openWorkspaceRulesFolder",
            async () => {
                if (!paths.workspaceRulesDir) {
                    vscode.window.showErrorMessage("No workspace folder is currently open.");
                    return;
                }
                if (!fs.existsSync(paths.workspaceRulesDir)) {
                    fs.mkdirSync(paths.workspaceRulesDir, { recursive: true });
                }
                await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(paths.workspaceRulesDir));
            }
        )
    );

    // 5. Rename Rule Command
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "boygr.antigravityCustomizationManager.renameRule",
            async (rulePath?: string) => {
                let targetRulePath = rulePath;

                if (!targetRulePath) {
                    const rules = await rulesManager.loadAllRules();
                    const renameableRules = rules.filter((r) => r.scope !== "workspace-root");
                    if (renameableRules.length === 0) {
                        vscode.window.showInformationMessage("No renameable rule files found.");
                        return;
                    }

                    const pick = await vscode.window.showQuickPick(
                        renameableRules.map((r) => ({
                            label: `$(file-text) ${r.name}`,
                            description: `[${r.scope}] ${r.title}`,
                            filePath: r.filePath,
                        })),
                        { placeHolder: "Select rule file to rename" }
                    );

                    if (!pick) return;
                    targetRulePath = pick.filePath;
                }

                const currentFileName = path.basename(targetRulePath).replace(/\.disabled$/, "");
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

                if (!newName || !newName.trim()) return;

                try {
                    const newPath = await rulesManager.renameRule(targetRulePath, newName.trim());
                    vscode.window.showInformationMessage(`Rule renamed to "${path.basename(newPath).replace(/\.disabled$/, "")}"`);
                    onStateChange();
                } catch (err: any) {
                    vscode.window.showErrorMessage(`Failed to rename rule: ${err.message}`);
                }
            }
        )
    );
}

