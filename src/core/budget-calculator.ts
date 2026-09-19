import { BudgetSummary, RuleItem, SkillItem } from "./types";

/**
 * Heuristic token estimation for Gemini / Antigravity models.
 * Approximately 4 characters per token for English and Markdown syntax.
 */
export function estimateTokens(text: string): number {
    if (!text || text.length === 0) {
        return 0;
    }
    // Whitespace and word boundaries refinement
    const charCount = text.length;
    const wordCount = text.trim().split(/\s+/).length;
    // Weighted blend: words * 1.33 and chars / 4
    const estimated = Math.ceil((charCount / 4 + wordCount * 1.3) / 2);
    return Math.max(1, estimated);
}

export function computeBudgetSummary(
    rules: RuleItem[],
    skills: SkillItem[],
    maxRulesBudget: number = 20000,
    ruleFileSizeLimitBytes: number = 24000
): BudgetSummary {
    let totalRulesTokens = 0;
    let activeRulesCount = 0;
    let rulesOverFileLimit = 0;

    for (const rule of rules) {
        if (rule.sizeBytes > ruleFileSizeLimitBytes) {
            rulesOverFileLimit++;
        }
        if (rule.isEnabled) {
            activeRulesCount++;
            totalRulesTokens += rule.estimatedTokens;
        }
    }

    let workspaceSkillsCount = 0;
    let pluginSkillsCount = 0;
    let builtinSkillsCount = 0;
    let totalSkillsDescriptionTokens = 0;

    for (const skill of skills) {
        if (skill.tier === "workspace") {
            workspaceSkillsCount++;
        } else if (skill.tier === "plugin") {
            pluginSkillsCount++;
        } else if (skill.tier === "builtin") {
            builtinSkillsCount++;
        }
        totalSkillsDescriptionTokens += skill.descriptionTokens;
    }

    const budgetPercent = Math.min(100, Math.round((totalRulesTokens / maxRulesBudget) * 100));
    const isOverBudget = totalRulesTokens > maxRulesBudget;

    return {
        totalRules: rules.length,
        activeRulesCount,
        totalRulesTokens,
        maxRulesBudget,
        isOverBudget,
        budgetPercent,
        rulesOverFileLimit,
        totalSkills: skills.length,
        workspaceSkillsCount,
        pluginSkillsCount,
        builtinSkillsCount,
        totalSkillsDescriptionTokens,
    };
}

