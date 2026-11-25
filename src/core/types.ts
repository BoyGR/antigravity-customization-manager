export type RuleScope =
    | "global"
    | "workspace-root"
    | "workspace-modular"
    | "multi-agent";

export interface RuleItem {
    id: string;
    name: string;
    title: string;
    filePath: string;
    scope: RuleScope;
    sizeBytes: number;
    estimatedTokens: number;
    isOverLimit: boolean; // > 24,000 bytes
    isEnabled: boolean; // false if ends with .disabled
    contentPreview: string;
    lastModified: number;
    targetAgent?: string;
}

export type SkillTier = "workspace" | "global" | "plugin" | "builtin";

export interface SkillItem {
    id: string;
    name: string;
    description: string;
    tier: SkillTier;
    folderPath: string;
    skillFilePath: string;
    isShadowed?: boolean;
    shadowedByTier?: SkillTier;
    hasScripts: boolean;
    hasReferences: boolean;
    hasExamples: boolean;
    hasResources: boolean;
    descriptionTokens: number;
    lastModified: number;
}

export interface BudgetSummary {
    totalRules: number;
    activeRulesCount: number;
    totalRulesTokens: number;
    maxRulesBudget: number; // default 20,000
    isOverBudget: boolean;
    budgetPercent: number;
    rulesOverFileLimit: number;
    totalSkills: number;
    workspaceSkillsCount: number;
    globalSkillsCount: number;
    pluginSkillsCount: number;
    builtinSkillsCount: number;
    totalSkillsDescriptionTokens: number;
}

export interface SystemPaths {
    homeDir: string;
    geminiGlobalDir: string;
    globalRulesDir: string;
    globalSkillsDir: string;
    globalPluginsDir: string;
    builtinSkillsDir: string;
    workspaceRoot: string | null;
    workspaceAgentsDir: string | null;
    workspaceRulesDir: string | null;
    workspaceSkillsDir: string | null;
}

export type ThemePreference = "vscode" | "dark" | "light" | "system";
export type LanguagePreference = "auto" | "en" | "id";

export interface UserPreferences {
    theme: ThemePreference;
    language: LanguagePreference;
    effectiveLanguage: "en" | "id";
    customAntigravityPath: string;
    defaultRulesBudget: number;
    ruleFileSizeLimitBytes: number;
    showStatusBarItem: boolean;
    enableMultiAgentSync: boolean;
}

export interface CustomizationState {
    rules: RuleItem[];
    skills: SkillItem[];
    budget: BudgetSummary;
    paths: SystemPaths;
    preferences: UserPreferences;
}

export type MultiAgentTarget =
    | "agents-md"
    | "codex-md"
    | "claude-md"
    | "cursorrules"
    | "copilot-instructions";

