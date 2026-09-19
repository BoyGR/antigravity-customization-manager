import * as fs from "fs";
import * as path from "path";
import { estimateTokens } from "./budget-calculator";
import { RuleItem, RuleScope, SystemPaths } from "./types";

export interface RuleTemplate {
    id: string;
    name: string;
    description: string;
    content: string;
}

export const RULE_TEMPLATES: RuleTemplate[] = [
    {
        id: "developer-sop",
        name: "Developer SOP & Strict Release Gates",
        description: "Enforces strict approval before commit/push/release, SemVer rules, and transparent review.",
        content: `# Developer SOP & Release Gates Protocol

## 1. Developer Identity & Transparency
- **Role**: AI Pair Programmer. Always explain technical rationale clearly before making changes.
- **Tone**: Professional, precise, constructive, and free of AI fluff.

## 2. Strict Approval Gates (Zero Automatic Actions)
- **Prohibited Actions**: NEVER perform git commit, git push, git tag, version bump, or package publishing without explicit user approval.
- **Review Requirement**: Always test locally first, present a clear summary of changes, and request confirmation before proceeding to release.

## 3. Versioning & SemVer
- Adhere strictly to Semantic Versioning (PATCH for fixes, MINOR for features, MAJOR for breaking changes).
- Maintain comprehensive changelog entries in CHANGELOG.md.
`,
    },
    {
        id: "git-protection",
        name: "Git Index & Repository Protection",
        description: "Zero direct access to .git/ internals, preserves git index stability on Windows.",
        content: `# Git Index & Repository Protection Rule

## Strict Policy: Zero Direct Access to .git/
You must NEVER directly read, write, modify, or delete any file or directory inside the \`.git/\` folder.

### Allowed Git Operations
- Only interact with the Git repository through standard Git CLI commands (\`git status\`, \`git diff\`, \`git add\`, \`git commit\`, \`git log\`).
- Maintain Git index stability on Windows: preserve \`core.fscache = false\` and \`core.preloadindex = false\`.
- Ensure no background processes hold locks on \`.git/index\` during operations.
`,
    },
    {
        id: "clean-architecture",
        name: "Clean Architecture & Folder Separation",
        description: "Keeps public repository clean, isolates internal docs, and enforces separation of concerns.",
        content: `# Architecture & Project Boundaries

## 1. Clean Public Repository
- Keep the repository root uncluttered and professional.
- Internal documentation, runbooks, and developer-only context must reside in an isolated \`.bgr/\` folder.
- The \`.bgr/\` directory must always be listed in \`.gitignore\` and never committed to public VCS.

## 2. Separation of Concerns
- Business logic and core services must remain independent of UI and view layers.
- Avoid tight coupling between modules; write self-contained, testable units.
- Do not commit local environment files, secret tokens, or generated build caches.
`,
    },
    {
        id: "antislop",
        name: "Anti-AI Slop & Tone Guidelines",
        description: "Eliminates generic boilerplate, robotic conversational filler, and over-verbose commentary.",
        content: `# Anti-AI Slop Guidelines

## Direct & Concise Communication
- Speak directly, technically, and concisely.
- Do not use generic conversational filler (e.g., "Certainly!", "I would be happy to help with that!", "As an AI language model...").
- When asked a technical question, deliver the solution or code immediately.

## Code Quality Standards
- No speculative, bloated boilerplate or unnecessary abstractions.
- Keep comments meaningful and focused on 'why', not obvious 'what'.
- Respect existing project patterns, styling conventions, and formatting.
`,
    },
];

export class RulesManager {
    constructor(
        private paths: SystemPaths,
        private ruleFileSizeLimitBytes: number = 24000
    ) {}

    public updatePaths(paths: SystemPaths, limitBytes?: number): void {
        this.paths = paths;
        if (limitBytes) {
            this.ruleFileSizeLimitBytes = limitBytes;
        }
    }

    public async loadAllRules(): Promise<RuleItem[]> {
        const rules: RuleItem[] = [];

        // 1. Global rules (~/.gemini/config/rules/*.md and *.disabled)
        if (fs.existsSync(this.paths.globalRulesDir)) {
            const globalFiles = this.scanDirForRules(this.paths.globalRulesDir);
            for (const file of globalFiles) {
                const item = this.parseRuleFile(file, "global");
                if (item) rules.push(item);
            }
        }

        // 2. Workspace root rules (GEMINI.md, AGENTS.md, etc.)
        if (this.paths.workspaceRoot && fs.existsSync(this.paths.workspaceRoot)) {
            const rootCandidates = [
                "AGENTS.md",
                "GEMINI.md",
                "AGENTS.md.disabled",
                "GEMINI.md.disabled",
            ];

            for (const candidate of rootCandidates) {
                const fullPath = path.join(this.paths.workspaceRoot, candidate);
                if (fs.existsSync(fullPath)) {
                    const item = this.parseRuleFile(fullPath, "workspace-root");
                    if (item) rules.push(item);
                }
            }

            // 3. Workspace modular rules (.agents/rules/*.md)
            if (this.paths.workspaceRulesDir && fs.existsSync(this.paths.workspaceRulesDir)) {
                const modularFiles = this.scanDirForRules(this.paths.workspaceRulesDir);
                for (const file of modularFiles) {
                    const item = this.parseRuleFile(file, "workspace-modular");
                    if (item) rules.push(item);
                }
            }

            // 4. Multi-agent rules in workspace (CLAUDE.md, .cursorrules, .github/copilot-instructions.md)
            const multiAgentCandidates = [
                { file: "CLAUDE.md", agent: "Claude Code" },
                { file: ".cursorrules", agent: "Cursor" },
                { file: path.join(".github", "copilot-instructions.md"), agent: "GitHub Copilot" },
            ];

            for (const candidate of multiAgentCandidates) {
                const fullPath = path.join(this.paths.workspaceRoot, candidate.file);
                if (fs.existsSync(fullPath)) {
                    const item = this.parseRuleFile(fullPath, "multi-agent", candidate.agent);
                    if (item) rules.push(item);
                }
            }
        }

        return rules;
    }

    private scanDirForRules(dir: string): string[] {
        const results: string[] = [];
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isFile()) {
                    const name = entry.name;
                    if (
                        name.endsWith(".md") ||
                        name.endsWith(".md.disabled") ||
                        name.endsWith(".mdc") ||
                        name.endsWith(".mdc.disabled")
                    ) {
                        results.push(path.join(dir, name));
                    }
                }
            }
        } catch {
            // Ignore directory read errors
        }
        return results;
    }

    private parseRuleFile(filePath: string, scope: RuleScope, targetAgent?: string): RuleItem | null {
        try {
            const stat = fs.statSync(filePath);
            const content = fs.readFileSync(filePath, "utf-8");
            const fileName = path.basename(filePath);
            const isEnabled = !fileName.endsWith(".disabled");

            let cleanName = fileName.replace(/\.disabled$/, "");
            const title = this.extractTitle(content) || cleanName;
            const sizeBytes = stat.size;
            const estimatedTokens = estimateTokens(content);
            const isOverLimit = sizeBytes > this.ruleFileSizeLimitBytes;

            const previewLines = content
                .split(/\r?\n/)
                .filter((l) => l.trim().length > 0 && !l.startsWith("#"))
                .slice(0, 3)
                .join(" ");

            return {
                id: filePath,
                name: cleanName,
                title,
                filePath,
                scope,
                sizeBytes,
                estimatedTokens,
                isOverLimit,
                isEnabled,
                contentPreview: previewLines.slice(0, 140) || "(No content preview available)",
                lastModified: stat.mtimeMs,
                targetAgent,
            };
        } catch {
            return null;
        }
    }

    private extractTitle(content: string): string | null {
        const match = content.match(/^#\s+(.+)$/m);
        return match ? match[1].trim() : null;
    }

    public async toggleRule(filePath: string): Promise<string> {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Rule file not found: ${filePath}`);
        }

        const isCurrentlyDisabled = filePath.endsWith(".disabled");
        const newPath = isCurrentlyDisabled
            ? filePath.replace(/\.disabled$/, "")
            : `${filePath}.disabled`;

        fs.renameSync(filePath, newPath);
        return newPath;
    }

    public async createRule(
        scope: "global" | "workspace",
        fileName: string,
        content: string
    ): Promise<string> {
        let normalizedName = fileName.trim();
        if (!normalizedName.endsWith(".md")) {
            normalizedName += ".md";
        }

        let targetDir: string;
        if (scope === "global") {
            targetDir = this.paths.globalRulesDir;
        } else {
            if (!this.paths.workspaceRulesDir) {
                throw new Error("No workspace is currently open.");
            }
            targetDir = this.paths.workspaceRulesDir;
        }

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const fullPath = path.join(targetDir, normalizedName);
        if (fs.existsSync(fullPath)) {
            throw new Error(`A rule with name "${normalizedName}" already exists in this location.`);
        }

        fs.writeFileSync(fullPath, content.trim() + "\n", "utf-8");
        return fullPath;
    }

    public async saveRuleContent(filePath: string, content: string): Promise<void> {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Rule file not found: ${filePath}`);
        }
        fs.writeFileSync(filePath, content, "utf-8");
    }

    public async deleteRule(filePath: string): Promise<void> {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    public async exportMultiAgentRule(
        sourceRulePath: string,
        targetAgent: "agents-md" | "codex-md" | "cursorrules" | "claude-md" | "copilot-instructions"
    ): Promise<string> {
        if (!this.paths.workspaceRoot) {
            throw new Error("Cannot sync to workspace without an active open project.");
        }

        const ruleContent = fs.readFileSync(sourceRulePath, "utf-8");
        let destinationFile = "";

        switch (targetAgent) {
            case "agents-md":
                destinationFile = path.join(this.paths.workspaceRoot, "AGENTS.md");
                break;
            case "codex-md":
                destinationFile = path.join(this.paths.workspaceRoot, "CODEX.md");
                break;
            case "cursorrules":
                destinationFile = path.join(this.paths.workspaceRoot, ".cursorrules");
                break;
            case "claude-md":
                destinationFile = path.join(this.paths.workspaceRoot, "CLAUDE.md");
                break;
            case "copilot-instructions": {
                const githubDir = path.join(this.paths.workspaceRoot, ".github");
                if (!fs.existsSync(githubDir)) {
                    fs.mkdirSync(githubDir, { recursive: true });
                }
                destinationFile = path.join(githubDir, "copilot-instructions.md");
                break;
            }
        }

        // Append or write
        if (fs.existsSync(destinationFile)) {
            const existing = fs.readFileSync(destinationFile, "utf-8");
            fs.writeFileSync(
                destinationFile,
                existing.trimEnd() + "\n\n---\n\n" + ruleContent.trim() + "\n",
                "utf-8"
            );
        } else {
            fs.writeFileSync(destinationFile, ruleContent.trim() + "\n", "utf-8");
        }

        return destinationFile;
    }
}

