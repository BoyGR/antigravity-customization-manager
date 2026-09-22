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
        id: "coding-standards",
        name: "Coding Standards & Best Practices",
        description: "Standards for clean code, type safety, modular architecture, and error handling.",
        content: `# Coding Standards & Best Practices

## 1. Code Quality & Formatting
- Write clean, readable, and maintainable code adhering to established project styling.
- Use explicit and descriptive naming for variables, functions, and classes.
- Keep functions small and focused on a single responsibility (SRP).

## 2. Robustness & Error Handling
- Always validate external input and API responses before processing.
- Handle potential exceptions gracefully with informative error messages.
- Avoid swallowing errors silently or using empty catch blocks.

## 3. Testing & Verification
- Write tests for core business logic, edge cases, and bug fixes.
- Ensure all existing unit and integration tests pass before completing tasks.
`,
    },
    {
        id: "security-guardrails",
        name: "Security & Secrets Protection",
        description: "Prevents leaking API keys, enforces secure configuration, and safe data handling.",
        content: `# Security & Secrets Protection

## 1. Secrets & Credentials Safety
- NEVER commit or hardcode API keys, tokens, passwords, or private certificates in source files.
- Load all sensitive configurations from environment variables or secret stores.
- Verify that configuration files containing credentials (e.g. \`.env\`) are ignored in \`.gitignore\`.

## 2. Input Validation & Data Sanitization
- Treat all external input as untrusted and validate against expected schemas.
- Use parameterized queries or ORM mechanisms to prevent injection vulnerabilities.
- Follow the principle of least privilege when requesting system or network permissions.
`,
    },
    {
        id: "documentation-standards",
        name: "Documentation & API Guidelines",
        description: "Guidelines for writing clear docstrings, README updates, and changelog tracking.",
        content: `# Documentation & API Guidelines

## 1. Inline & Code Documentation
- Document public APIs, interfaces, and complex algorithms with clear docstrings.
- State parameters, return types, and possible exceptions explicitly.
- Explain the technical rationale ("why") behind non-obvious architecture decisions.

## 2. Project Documentation & Maintenance
- Keep the project \`README.md\` accurate when introducing new features, commands, or requirements.
- Document any breaking changes and migration paths clearly.
- Provide clear setup, build, and contribution instructions for collaborators.
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

    public async renameRule(filePath: string, newFileName: string): Promise<string> {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Rule file not found: ${filePath}`);
        }

        const dir = path.dirname(filePath);
        const isCurrentlyDisabled = filePath.endsWith(".disabled");

        let cleanName = newFileName.trim();
        if (cleanName.endsWith(".disabled")) {
            cleanName = cleanName.replace(/\.disabled$/, "");
        }

        if (!cleanName.endsWith(".md")) {
            cleanName += ".md";
        }

        const finalTargetName = isCurrentlyDisabled ? `${cleanName}.disabled` : cleanName;
        const targetPath = path.join(dir, finalTargetName);

        if (path.resolve(targetPath).toLowerCase() === path.resolve(filePath).toLowerCase()) {
            if (path.basename(targetPath) === path.basename(filePath)) {
                return filePath;
            }
        } else if (fs.existsSync(targetPath)) {
            throw new Error(`A rule named "${cleanName}" already exists in this location.`);
        }

        fs.renameSync(filePath, targetPath);
        return targetPath;
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

