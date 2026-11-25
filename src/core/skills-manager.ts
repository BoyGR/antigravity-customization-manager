import * as fs from "fs";
import * as path from "path";
import { estimateTokens } from "./budget-calculator";
import { SkillItem, SkillTier, SystemPaths } from "./types";

export interface CreateSkillOptions {
    name: string;
    description: string;
    createScriptsFolder?: boolean;
    createReferencesFolder?: boolean;
    createExamplesFolder?: boolean;
    createResourcesFolder?: boolean;
    initialInstruction?: string;
}

export class SkillsManager {
    constructor(private paths: SystemPaths) {}

    public updatePaths(paths: SystemPaths): void {
        this.paths = paths;
    }

    public async loadAllSkills(): Promise<SkillItem[]> {
        const skills: SkillItem[] = [];
        const seenNames = new Map<string, SkillTier>();

        // 1. Workspace Skills (Highest Precedence)
        if (this.paths.workspaceSkillsDir && fs.existsSync(this.paths.workspaceSkillsDir)) {
            const workspaceSkills = this.scanSkillsDirectory(this.paths.workspaceSkillsDir, "workspace");
            for (const skill of workspaceSkills) {
                skills.push(skill);
                seenNames.set(skill.name.toLowerCase(), "workspace");
            }
        }

        // 2. Global User Skills (~/.gemini/config/skills/)
        if (fs.existsSync(this.paths.globalSkillsDir)) {
            const globalSkills = this.scanSkillsDirectory(this.paths.globalSkillsDir, "global");
            for (const skill of globalSkills) {
                const lowerName = skill.name.toLowerCase();
                if (seenNames.has(lowerName)) {
                    skill.isShadowed = true;
                    skill.shadowedByTier = seenNames.get(lowerName);
                } else {
                    seenNames.set(lowerName, "global");
                }
                skills.push(skill);
            }
        }

        // 3. Global Plugin Skills
        if (fs.existsSync(this.paths.globalPluginsDir)) {
            const pluginSkills = this.scanPluginSkillsDirectory(this.paths.globalPluginsDir);
            for (const skill of pluginSkills) {
                const lowerName = skill.name.toLowerCase();
                if (seenNames.has(lowerName)) {
                    skill.isShadowed = true;
                    skill.shadowedByTier = seenNames.get(lowerName);
                } else {
                    seenNames.set(lowerName, "plugin");
                }
                skills.push(skill);
            }
        }

        // 4. Built-in System Skills
        if (fs.existsSync(this.paths.builtinSkillsDir)) {
            const builtinSkills = this.scanSkillsDirectory(this.paths.builtinSkillsDir, "builtin");
            for (const skill of builtinSkills) {
                const lowerName = skill.name.toLowerCase();
                if (seenNames.has(lowerName)) {
                    skill.isShadowed = true;
                    skill.shadowedByTier = seenNames.get(lowerName);
                } else {
                    seenNames.set(lowerName, "builtin");
                }
                skills.push(skill);
            }
        }

        return skills;
    }

    private scanSkillsDirectory(dir: string, tier: SkillTier): SkillItem[] {
        const results: SkillItem[] = [];
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const skillDir = path.join(dir, entry.name);
                    const skillFilePath = path.join(skillDir, "SKILL.md");
                    if (fs.existsSync(skillFilePath)) {
                        const item = this.parseSkill(entry.name, skillDir, skillFilePath, tier);
                        if (item) results.push(item);
                    }
                }
            }
        } catch {
            // Ignore scan errors
        }
        return results;
    }

    private scanPluginSkillsDirectory(pluginsDir: string): SkillItem[] {
        const results: SkillItem[] = [];
        try {
            const pluginEntries = fs.readdirSync(pluginsDir, { withFileTypes: true });
            for (const plugin of pluginEntries) {
                if (plugin.isDirectory()) {
                    const skillsSubDir = path.join(pluginsDir, plugin.name, "skills");
                    if (fs.existsSync(skillsSubDir)) {
                        const pluginSkills = this.scanSkillsDirectory(skillsSubDir, "plugin");
                        results.push(...pluginSkills);
                    }
                }
            }
        } catch {
            // Ignore scan errors
        }
        return results;
    }

    private parseSkill(
        folderName: string,
        folderPath: string,
        skillFilePath: string,
        tier: SkillTier
    ): SkillItem | null {
        try {
            const stat = fs.statSync(skillFilePath);
            const content = fs.readFileSync(skillFilePath, "utf-8");

            const { name, description } = this.extractFrontmatter(content, folderName);
            const descriptionTokens = estimateTokens(description);

            const hasScripts = fs.existsSync(path.join(folderPath, "scripts"));
            const hasReferences = fs.existsSync(path.join(folderPath, "references"));
            const hasExamples = fs.existsSync(path.join(folderPath, "examples"));
            const hasResources = fs.existsSync(path.join(folderPath, "resources"));

            return {
                id: folderPath,
                name: name || folderName,
                description: description || "No description provided in SKILL.md frontmatter.",
                tier,
                folderPath,
                skillFilePath,
                hasScripts,
                hasReferences,
                hasExamples,
                hasResources,
                descriptionTokens,
                lastModified: stat.mtimeMs,
            };
        } catch {
            return null;
        }
    }

    private extractFrontmatter(
        content: string,
        fallbackName: string
    ): { name: string; description: string } {
        const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
        const match = content.match(frontmatterRegex);

        if (!match) {
            return {
                name: fallbackName,
                description: "",
            };
        }

        const yamlText = match[1];
        let name = fallbackName;
        let description = "";

        // Extract name
        const nameMatch = yamlText.match(/^name:\s*(.+)$/m);
        if (nameMatch) {
            name = nameMatch[1].trim().replace(/^["']|["']$/g, "");
        }

        // Extract description (handles both single line and multiline >- or |-)
        const descMatch = yamlText.match(/^description:\s*(?:>-\s*|\|-\s*)?([\s\S]*?)(?=^[a-zA-Z0-9_-]+:|$)/m);
        if (descMatch) {
            description = descMatch[1]
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line.length > 0)
                .join(" ");
        }

        return { name, description };
    }

    public async createSkill(options: CreateSkillOptions): Promise<string> {
        if (!this.paths.workspaceSkillsDir) {
            throw new Error("No active workspace found to create a workspace skill.");
        }

        const normalizedName = options.name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-_]/g, "-")
            .replace(/--+/g, "-");

        if (!normalizedName) {
            throw new Error("Skill name cannot be empty.");
        }

        const skillFolder = path.join(this.paths.workspaceSkillsDir, normalizedName);
        if (fs.existsSync(skillFolder)) {
            throw new Error(`Skill "${normalizedName}" already exists in workspace.`);
        }

        fs.mkdirSync(skillFolder, { recursive: true });

        if (options.createScriptsFolder) {
            fs.mkdirSync(path.join(skillFolder, "scripts"), { recursive: true });
        }
        if (options.createReferencesFolder) {
            fs.mkdirSync(path.join(skillFolder, "references"), { recursive: true });
        }
        if (options.createExamplesFolder) {
            fs.mkdirSync(path.join(skillFolder, "examples"), { recursive: true });
        }
        if (options.createResourcesFolder) {
            fs.mkdirSync(path.join(skillFolder, "resources"), { recursive: true });
        }

        const skillMarkdown = `---
name: ${normalizedName}
description: >-
  ${options.description.trim()}
---

# ${options.name}

${options.initialInstruction || "Provide step-by-step procedures and guidance for the agent here."}

## Instructions
1. Step one: Define execution steps clearly.
2. Step two: Add verification points.
`;

        const skillFilePath = path.join(skillFolder, "SKILL.md");
        fs.writeFileSync(skillFilePath, skillMarkdown, "utf-8");
        return skillFilePath;
    }

    public async forkToWorkspace(sourceSkillFolderPath: string): Promise<string> {
        if (!this.paths.workspaceSkillsDir) {
            throw new Error("No active workspace found to fork skill into.");
        }

        const folderName = path.basename(sourceSkillFolderPath);
        const targetFolder = path.join(this.paths.workspaceSkillsDir, folderName);

        if (fs.existsSync(targetFolder)) {
            throw new Error(`A workspace skill named "${folderName}" already exists.`);
        }

        if (!fs.existsSync(this.paths.workspaceSkillsDir)) {
            fs.mkdirSync(this.paths.workspaceSkillsDir, { recursive: true });
        }

        this.copyFolderRecursiveSync(sourceSkillFolderPath, targetFolder);
        return path.join(targetFolder, "SKILL.md");
    }

    private copyFolderRecursiveSync(source: string, target: string): void {
        fs.mkdirSync(target, { recursive: true });
        const items = fs.readdirSync(source, { withFileTypes: true });

        for (const item of items) {
            const srcPath = path.join(source, item.name);
            const dstPath = path.join(target, item.name);

            if (item.isDirectory()) {
                this.copyFolderRecursiveSync(srcPath, dstPath);
            } else {
                fs.copyFileSync(srcPath, dstPath);
            }
        }
    }

    public async deleteWorkspaceSkill(skillFolderPath: string): Promise<void> {
        if (!fs.existsSync(skillFolderPath)) {
            return;
        }
        // Safety check: only allow deletion within workspaceSkillsDir
        if (this.paths.workspaceSkillsDir && skillFolderPath.startsWith(this.paths.workspaceSkillsDir)) {
            fs.rmSync(skillFolderPath, { recursive: true, force: true });
        } else {
            throw new Error("Cannot delete skills outside of the local workspace skills folder.");
        }
    }
}

