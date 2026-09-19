import * as vscode from "vscode";
import { SkillsManager } from "../core/skills-manager";
import { SystemPaths } from "../core/types";

export function registerSkillCommands(
    context: vscode.ExtensionContext,
    skillsManager: SkillsManager,
    paths: SystemPaths,
    onStateChange: () => void
): void {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "boygr.antigravityCustomizationManager.createSkill",
            async () => {
                if (!paths.workspaceSkillsDir) {
                    vscode.window.showErrorMessage(
                        "Cannot create a workspace skill: No workspace folder is currently open."
                    );
                    return;
                }

                const name = await vscode.window.showInputBox({
                    prompt: "Enter unique skill identifier in kebab-case (e.g. run-e2e-tests, deploy-workflow)",
                    placeHolder: "my-custom-skill",
                    validateInput: (val) => {
                        if (!val.trim()) return "Skill name cannot be empty.";
                        if (!/^[a-z0-9-_]+$/.test(val.trim())) {
                            return "Use only lowercase letters, numbers, hyphens, or underscores.";
                        }
                        return null;
                    },
                });

                if (!name) return;

                const description = await vscode.window.showInputBox({
                    prompt: "Describe when the agent should activate this skill (use third-person: 'Use this skill when...')",
                    placeHolder: "Use this skill when the user asks to perform XYZ operations.",
                    validateInput: (val) => {
                        if (!val.trim()) return "Description is required for progressive disclosure.";
                        return null;
                    },
                });

                if (!description) return;

                const folderOptions = await vscode.window.showQuickPick(
                    [
                        { label: "$(terminal) Include scripts/ directory", picked: true, key: "scripts" },
                        { label: "$(book) Include references/ directory", picked: true, key: "references" },
                        { label: "$(code) Include examples/ directory", picked: false, key: "examples" },
                    ],
                    { canPickMany: true, placeHolder: "Select optional subdirectories to scaffold" }
                );

                const keys = new Set((folderOptions || []).map((o) => o.key));

                try {
                    const skillFilePath = await skillsManager.createSkill({
                        name,
                        description,
                        createScriptsFolder: keys.has("scripts"),
                        createReferencesFolder: keys.has("references"),
                        createExamplesFolder: keys.has("examples"),
                    });

                    vscode.window.showInformationMessage(`Skill created: ${name}`);
                    onStateChange();

                    const doc = await vscode.workspace.openTextDocument(skillFilePath);
                    await vscode.window.showTextDocument(doc);
                } catch (err: any) {
                    vscode.window.showErrorMessage(`Failed to create skill: ${err.message}`);
                }
            }
        )
    );
}

