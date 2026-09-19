# Changelog

All notable changes to the **Antigravity Customization Manager** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-19

### Added
- **Initial release of Antigravity Customization Manager** by [Boy Gilang Ramadhan](https://boygr.com).
- **Rules Manager**:
  - Multi-scope discovery: Global (`~/.gemini/config/rules/`), Workspace root (`GEMINI.md`, `AGENTS.md`), and Workspace modular (`.agents/rules/*.md`).
  - Per-file size limit indicator (24,000 bytes hard cap) with line truncation warnings.
  - Aggregate token budget gauge (20,000 tokens Antigravity budget).
  - Built-in rule templates (Developer SOP, Architecture Guardrails, Anti-AI Slop, Git Protection).
  - Quick toggle to enable/disable rules without deleting them.
- **Skills Manager**:
  - Multi-tier discovery: Workspace (`.agents/skills/`), Global Plugins, and Built-in System Skills.
  - Skill Precedence and Shadowing detection (Workspace overrides Built-in).
  - Skill Generator Wizard with strict YAML frontmatter validation (`name`, `description`).
  - **Fork to Workspace** feature to clone built-in or plugin skills to workspace for local modification.
- **Multi-Agent Bridge**:
  - Export and sync rules across AI agents (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`).
- **UI & Performance**:
  - Zero external runtime dependencies; lightweight, responsive Vanilla Webview.
  - Full bilingual support (**Bahasa Indonesia** and **English**).
  - Native VS Code theme integration (Dark Modern, Light Modern, High Contrast).
  - Status Bar item showing real-time rules & skills count and budget health.

