# Changelog

All notable changes to the **Antigravity Customization Manager** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2026-09-22

### Changed
- **Universal Rule Templates**: Replaced initial rule starter templates with 3 completely generic, industry-standard software engineering templates (*Coding Standards & Best Practices*, *Security & Secrets Protection*, and *Documentation & API Guidelines*).

## [0.1.2] - 2026-09-22

### Added
- **Rule File Renaming**: Added the ability to safely rename rule files directly from the UI card actions (*"Ubah Nama"* / *"Rename"*).
- **Name Collision & State Protection**: Automatic validation preventing accidental overwrite of existing rules, automatic `.md` extension normalization, and preservation of `.disabled` suffix for inactive rules.
- **Root File Integrity Guard**: Root configuration files (`GEMINI.md` and `AGENTS.md`) are shielded from renaming to prevent breaking workspace Antigravity configurations.
- **Command Palette Action**: Registered `Antigravity Customization Manager: Rename Rule...` command with interactive QuickPick selector and input validation.

## [0.1.1] - 2026-09-20

### Fixed
- **Skills Folder Opener**: Resolved issue where clicking "Open Folder" in the Skills tab did not trigger if the workspace skills folder (`.agents/skills`) had not yet been created. The folder is now created automatically before opening in File Explorer / OS file manager.

### Added
- **Scope-Aware Folder Opening**: The "Open Folder" button now intelligently opens the corresponding folder depending on the active filter scope:
  - **Workspace / All Scope**: Opens `.agents/skills/` in the active workspace.
  - **Built-in Scope**: Opens the native Antigravity builtin skills directory.
  - **Plugins Scope**: Opens the global plugins directory.
- **Enhanced Toast Feedback**: Added graceful notification if no valid skills path is found for the chosen scope (`noFolderAvailable` in EN and ID).

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

