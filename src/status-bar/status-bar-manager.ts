import * as vscode from "vscode";
import { BudgetSummary } from "../core/types";

export class StatusBarManager implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = "boygr.antigravityCustomizationManager.focusView";
    }

    public update(budget: BudgetSummary, enabled: boolean): void {
        if (!enabled) {
            this.statusBarItem.hide();
            return;
        }

        const tokenDisplay =
            budget.totalRulesTokens >= 1000
                ? `${(budget.totalRulesTokens / 1000).toFixed(1)}k`
                : `${budget.totalRulesTokens}`;

        const isWarning = budget.isOverBudget || budget.rulesOverFileLimit > 0;
        const brandIcon = "$(antigravity-custom-logo)";
        const warningBadge = isWarning ? "⚠️ " : "";

        this.statusBarItem.text = `${brandIcon} ${warningBadge}Rules: ${budget.activeRulesCount} (${tokenDisplay} tok) | Skills: ${budget.totalSkills}`;

        let tooltip = `Antigravity Customization Manager\n\n`;
        tooltip += `Active Rules: ${budget.activeRulesCount} (${tokenDisplay} / ${(budget.maxRulesBudget / 1000).toFixed(0)}k tokens)\n`;
        tooltip += `Total Skills: ${budget.totalSkills} (${budget.workspaceSkillsCount} workspace, ${budget.pluginSkillsCount} plugins, ${budget.builtinSkillsCount} builtin)\n`;

        if (budget.rulesOverFileLimit > 0) {
            tooltip += `\n⚠️ ${budget.rulesOverFileLimit} rule(s) exceed 24 KB per-file limit!`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor(
                "statusBarItem.warningBackground"
            );
        } else if (budget.isOverBudget) {
            tooltip += `\n⚠️ Total rules token budget exceeded (${budget.budgetPercent}%)!`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor(
                "statusBarItem.errorBackground"
            );
        } else {
            this.statusBarItem.backgroundColor = undefined;
        }

        tooltip += `\n\nClick to open Antigravity Customization Manager dashboard.`;
        this.statusBarItem.tooltip = tooltip;
        this.statusBarItem.show();
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}

