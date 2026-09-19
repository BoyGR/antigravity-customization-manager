import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { SystemPaths } from "./types";

export function resolveSystemPaths(customAntigravityPath?: string): SystemPaths {
    const homeDir = os.homedir();

    let geminiGlobalDir = customAntigravityPath?.trim()
        ? customAntigravityPath.trim()
        : path.join(homeDir, ".gemini");

    // Expand ~ if provided in custom path
    if (geminiGlobalDir.startsWith("~")) {
        geminiGlobalDir = path.join(homeDir, geminiGlobalDir.slice(1));
    }

    const globalRulesDir = path.join(geminiGlobalDir, "config", "rules");
    const globalPluginsDir = path.join(geminiGlobalDir, "config", "plugins");
    const builtinSkillsDir = path.join(geminiGlobalDir, "antigravity", "builtin", "skills");

    // Workspace detection
    let workspaceRoot: string | null = null;
    let workspaceAgentsDir: string | null = null;
    let workspaceRulesDir: string | null = null;
    let workspaceSkillsDir: string | null = null;

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        workspaceRoot = workspaceFolders[0].uri.fsPath;

        // Check .agents, or fallback to .agent
        const candidateAgentsDir = path.join(workspaceRoot, ".agents");
        const candidateAltAgentDir = path.join(workspaceRoot, ".agent");

        if (fs.existsSync(candidateAgentsDir)) {
            workspaceAgentsDir = candidateAgentsDir;
        } else if (fs.existsSync(candidateAltAgentDir)) {
            workspaceAgentsDir = candidateAltAgentDir;
        } else {
            // Default to .agents if neither exists yet
            workspaceAgentsDir = candidateAgentsDir;
        }

        workspaceRulesDir = path.join(workspaceAgentsDir, "rules");
        workspaceSkillsDir = path.join(workspaceAgentsDir, "skills");
    }

    return {
        homeDir,
        geminiGlobalDir,
        globalRulesDir,
        globalPluginsDir,
        builtinSkillsDir,
        workspaceRoot,
        workspaceAgentsDir,
        workspaceRulesDir,
        workspaceSkillsDir,
    };
}

