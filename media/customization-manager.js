(function () {
    const vscode = acquireVsCodeApi();

    const i18n = {
        en: {
            appName: "Antigravity Customization",
            developedBy: "Developed by",
            tabRules: "Rules",
            tabSkills: "Skills",
            tabBudget: "Budget & Health",
            filterAll: "All Scopes",
            filterWorkspace: "Workspace",
            filterGlobal: "Global Machine",
            filterBuiltin: "Built-in",
            btnNewRule: "New Rule",
            btnNewSkill: "New Skill",
            btnSyncAgents: "Multi-Agent Sync",
            btnOpenFolder: "Open Folder",
            rulesBudgetTitle: "Rules Token Budget",
            budgetHint: "Antigravity automatically demotes rules from inline context to path pointers if total active rules exceed 20,000 tokens.",
            fileCapTitle: "Per-File Size Limit (24 KB)",
            fileCapHint: "Rule files larger than 24,000 bytes are strictly truncated on line boundaries by Antigravity.",
            skillsOverviewTitle: "Skills Progressive Disclosure",
            statWorkspace: "Workspace",
            statPlugins: "Plugins",
            statBuiltin: "Built-in",
            skillsTokensHint: "Estimated frontmatter description overhead injected into primary prompt:",
            precedenceTitle: "Resolution Precedence Order",
            openInEditor: "Open",
            editRule: "Quick Edit",
            forkToWorkspace: "Fork to Workspace",
            delete: "Delete",
            cancel: "Cancel",
            save: "Save",
            create: "Create",
            sync: "Sync",
            safeStatus: "Safe",
            warningStatus: "Warning",
            exceededStatus: "Exceeded",
            active: "Active",
            disabled: "Disabled",
            shadowed: "Shadowed",
            scopeGlobal: "Global",
            scopeWorkspace: "Workspace",
            scopeBuiltin: "Built-in",
            ruleNamePrompt: "Rule File Name (.md)",
            ruleScopePrompt: "Scope",
            ruleTemplatePrompt: "Template",
            skillNamePrompt: "Skill Name (kebab-case)",
            skillDescPrompt: "Description (Use third-person prompt trigger)",
            includeScripts: "Include scripts/ directory",
            includeReferences: "Include references/ directory",
            includeExamples: "Include examples/ directory",
            syncTargetAgent: "Target Agent Format",
            confirmDeleteRule: "Are you sure you want to delete this rule?",
            confirmDeleteSkill: "Are you sure you want to delete this workspace skill?",
            settingsTitle: "Settings",
            appearanceGroup: "Appearance & Language",
            themeLabel: "Theme",
            followVsCode: "Follow VS Code (Default)",
            dark: "Dark",
            light: "Light",
            system: "System (OS)",
            languageLabel: "Language",
            langAuto: "Follow VS Code (Auto)",
            langEn: "English",
            langId: "Bahasa Indonesia",
            governanceGroup: "Antigravity Governance & Limits",
            budgetLabel: "Rules Token Budget",
            budgetSettingHint: "Total inline rules budget before pointer demotion (Default: 20,000 tokens).",
            fileCapLabel: "Rule File Size Limit (Bytes)",
            fileCapSettingHint: "Hard boundary truncate limit per rule file (Default: 24,000 bytes).",
            showStatusBarLabel: "Show Status Bar Indicator",
            showStatusBarHint: "Display token count and health summary in the VS Code status bar.",
            multiAgentSyncLabel: "Enable Multi-Agent Rule Export",
            multiAgentSyncHint: "Allow 1-click sync to Cursor (.cursorrules), Claude (CLAUDE.md), and Copilot.",
            customPathLabel: "Custom Antigravity Path",
            customPathHint: "Optional override path for Antigravity directory (leave blank for auto-detect).",
            about: "About",
            developer: "Developer",
            website: "Website",
            settingsHint: "Changes apply only after Save.",
            resetToDefault: "Reset to Default",
            resetSettingsNotice: "Settings reset to default values. Click Save to apply.",
            aboutGroup: "About",
            developerLabel: "Developer",
            websiteLabel: "Website",
            versionLabel: "Version",
            settingsNote: "Changes apply only after Save.",
            settingsSaved: "Settings saved successfully.",
            fileNameRequired: "Rule file name is required.",
            skillRequired: "Skill name and description are required.",
            noRulesToSync: "No rules available to sync.",
            noRulesMatch: "No rules matching your filter.",
            noSkillsMatch: "No skills matching your filter.",
            ruleToggled: "Rule status updated.",
        },
        id: {
            appName: "Antigravity Customization",
            developedBy: "Dikembangkan oleh",
            tabRules: "Aturan (Rules)",
            tabSkills: "Keahlian (Skills)",
            tabBudget: "Budget & Diagnostik",
            filterAll: "Semua Scope",
            filterWorkspace: "Workspace",
            filterGlobal: "Global Mesin",
            filterBuiltin: "Bawaan Sistem",
            btnNewRule: "Rule Baru",
            btnNewSkill: "Skill Baru",
            btnSyncAgents: "Sinkronisasi Multi-Agent",
            btnOpenFolder: "Buka Folder",
            rulesBudgetTitle: "Budget Token Rules",
            budgetHint: "Antigravity otomatis mendemosi rule dari teks penuh menjadi pointer jika total rule aktif melebihi 20.000 token.",
            fileCapTitle: "Batas Ukuran Per-File (24 KB)",
            fileCapHint: "File rule yang melebihi 24.000 byte akan dipotong paksa pada batas baris oleh Antigravity.",
            skillsOverviewTitle: "Progressive Disclosure Skills",
            statWorkspace: "Workspace",
            statPlugins: "Plugin",
            statBuiltin: "Bawaan",
            skillsTokensHint: "Perkiraan beban token deskripsi yang disuntikkan ke prompt utama:",
            precedenceTitle: "Urutan Prioritas Resolusi",
            openInEditor: "Buka",
            editRule: "Edit Cepat",
            forkToWorkspace: "Salin ke Workspace",
            delete: "Hapus",
            cancel: "Batal",
            save: "Simpan",
            create: "Buat",
            sync: "Sinkronkan",
            safeStatus: "Aman",
            warningStatus: "Peringatan",
            exceededStatus: "Melebihi Batas",
            active: "Aktif",
            disabled: "Nonaktif",
            shadowed: "Tertimpa",
            scopeGlobal: "Global",
            scopeWorkspace: "Workspace",
            scopeBuiltin: "Bawaan",
            ruleNamePrompt: "Nama File Rule (.md)",
            ruleScopePrompt: "Cakupan (Scope)",
            ruleTemplatePrompt: "Template Awal",
            skillNamePrompt: "Nama Skill (kebab-case)",
            skillDescPrompt: "Deskripsi (Gunakan pemicu orang ketiga: 'Gunakan saat...')",
            includeScripts: "Sertakan folder scripts/",
            includeReferences: "Sertakan folder references/",
            includeExamples: "Sertakan folder examples/",
            syncTargetAgent: "Format Agent Tujuan",
            confirmDeleteRule: "Apakah Anda yakin ingin menghapus rule ini?",
            confirmDeleteSkill: "Apakah Anda yakin ingin menghapus skill workspace ini?",
            settingsTitle: "Pengaturan",
            appearanceGroup: "Tampilan & Bahasa",
            themeLabel: "Tema Tampilan",
            followVsCode: "Ikuti Tema VS Code (Bawaan)",
            dark: "Mode Gelap (Dark)",
            light: "Mode Terang (Light)",
            system: "Ikuti Tema Sistem (OS)",
            languageLabel: "Bahasa (Language)",
            langAuto: "Ikuti VS Code (Otomatis)",
            langEn: "English",
            langId: "Bahasa Indonesia",
            governanceGroup: "Governance & Batasan Antigravity",
            budgetLabel: "Budget Token Rules",
            budgetSettingHint: "Batas total token rule aktif sebelum didemosi ke pointer (Bawaan: 20.000 token).",
            fileCapLabel: "Batas Ukuran File Rule (Byte)",
            fileCapSettingHint: "Batas pemotongan baris paksa per file rule (Bawaan: 24.000 byte).",
            showStatusBarLabel: "Tampilkan Indikator di Status Bar",
            showStatusBarHint: "Tampilkan ringkasan token dan kesehatan di status bar VS Code.",
            multiAgentSyncLabel: "Aktifkan Ekspor Multi-Agent Rule",
            multiAgentSyncHint: "Izinkan sinkronisasi 1-klik ke Cursor (.cursorrules), Claude (CLAUDE.md), dan Copilot.",
            customPathLabel: "Jalur Kustom Antigravity",
            customPathHint: "Jalur khusus direktori Antigravity (kosongkan untuk deteksi otomatis).",
            about: "Tentang",
            developer: "Developer",
            website: "Situs",
            settingsHint: "Perubahan baru diterapkan setelah Simpan.",
            resetToDefault: "Atur Ulang ke Default",
            resetSettingsNotice: "Pengaturan dikembalikan ke nilai default. Klik Simpan untuk menerapkan.",
            aboutGroup: "Tentang",
            developerLabel: "Developer",
            websiteLabel: "Situs",
            versionLabel: "Versi",
            settingsNote: "Perubahan baru diterapkan setelah Simpan.",
            settingsSaved: "Pengaturan berhasil disimpan.",
            fileNameRequired: "Nama file aturan wajib diisi.",
            skillRequired: "Nama dan deskripsi keahlian wajib diisi.",
            noRulesToSync: "Tidak ada aturan yang tersedia untuk disinkronkan.",
            noRulesMatch: "Tidak ada aturan yang cocok dengan filter Anda.",
            noSkillsMatch: "Tidak ada keahlian yang cocok dengan filter Anda.",
            ruleToggled: "Status aturan diperbarui.",
        },
    };

    let state = {
        rules: [],
        skills: [],
        budget: null,
        paths: null,
        preferences: {
            effectiveLanguage: "en",
        },
        meta: {
            version: "0.1.0",
            developer: "Boy Gilang Ramadhan (BoyGR)",
            website: "https://boygr.com",
            iconUri: "",
        },
        templates: [],
        filterQuery: "",
        rulesScope: "all",
        skillsScope: "all",
        activeTab: "tab-rules",
    };

    // DOM Elements
    const appContainer = document.querySelector(".app-container");
    if (appContainer && appContainer.dataset) {
        if (appContainer.dataset.iconUri) state.meta.iconUri = appContainer.dataset.iconUri;
        if (appContainer.dataset.version) state.meta.version = appContainer.dataset.version;
        if (appContainer.dataset.developer) state.meta.developer = appContainer.dataset.developer;
        if (appContainer.dataset.website) state.meta.website = appContainer.dataset.website;
    }

    const searchInput = document.getElementById("search-input");
    const rulesScopeFilter = document.getElementById("rules-scope-filter");
    const skillsScopeFilter = document.getElementById("skills-scope-filter");
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");
    const rulesList = document.getElementById("rules-list");
    const skillsList = document.getElementById("skills-list");
    const statsBar = document.getElementById("stats-bar");
    const btnNewRule = document.getElementById("btn-new-rule");
    const btnNewSkill = document.getElementById("btn-new-skill");
    const btnSyncAgents = document.getElementById("btn-sync-agents");
    const btnOpenSkillsFolder = document.getElementById("btn-open-skills-folder");
    const devLink = document.getElementById("developer-link");

    // Modal Elements
    const modalOverlay = document.getElementById("modal-overlay");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalFooter = document.getElementById("modal-footer");
    const modalCloseBtn = document.getElementById("modal-close-btn");

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    let toastTimer = null;
    function showToast(message, kind = "info") {
        let host = document.getElementById("toast-host");
        if (!host) {
            host = document.createElement("div");
            host.id = "toast-host";
            host.className = "toast-host";
            host.setAttribute("aria-live", "polite");
            host.setAttribute("aria-atomic", "true");
            document.body.appendChild(host);
        }
        if (toastTimer) {
            clearTimeout(toastTimer);
        }
        const symbol = kind === "error" ? "!" : kind === "warning" ? "!" : kind === "success" ? "✓" : "ℹ";
        host.innerHTML = `
            <div class="toast ${escapeHtml(kind)}" role="status">
                <span class="toast-symbol" aria-hidden="true">${symbol}</span>
                <span class="toast-message">${escapeHtml(message)}</span>
            </div>
        `;
        toastTimer = setTimeout(() => {
            if (host) host.innerHTML = "";
        }, 3000);
    }

    function applyTheme() {
        const root = document.documentElement;
        const preference = state.preferences?.theme || "vscode";

        root.removeAttribute("data-ag-theme");

        if (preference === "light" || preference === "dark") {
            root.setAttribute("data-ag-theme", preference);
            return;
        }

        if (preference === "system") {
            try {
                const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                root.setAttribute("data-ag-theme", dark ? "dark" : "light");
            } catch {
                // Ignore matchMedia error
            }
        }
    }

    function t(key) {
        const lang = state.preferences.effectiveLanguage || "en";
        return (i18n[lang] && i18n[lang][key]) || (i18n.en && i18n.en[key]) || key;
    }

    function updateLanguageUi() {
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            if (key) {
                el.textContent = t(key);
            }
        });
        const footerPrefix = document.querySelector(".footer-prefix");
        if (footerPrefix) {
            footerPrefix.textContent = t("developedBy");
        }
        const footerVersion = document.querySelector(".footer-version");
        if (footerVersion && state.meta?.version) {
            footerVersion.textContent = `v${state.meta.version}`;
        }
    }

    // Modal Helper
    function showModal(title, bodyHtml, footerButtons) {
        modalTitle.textContent = title;
        modalBody.innerHTML = bodyHtml;
        modalFooter.innerHTML = "";

        footerButtons.forEach((btnConfig) => {
            const btn = document.createElement("button");
            btn.className = `btn ${btnConfig.primary ? "btn-primary" : "btn-secondary"}`;
            btn.textContent = btnConfig.label;
            btn.addEventListener("click", () => {
                if (btnConfig.onClick) {
                    btnConfig.onClick();
                }
            });
            modalFooter.appendChild(btn);
        });

        modalOverlay.classList.remove("hidden");
    }

    function closeModal() {
        modalOverlay.classList.add("hidden");
        modalBody.innerHTML = "";
        modalFooter.innerHTML = "";
    }

    modalCloseBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (settingsDraft) {
                closeSettingsModal();
                return;
            }
            if (!modalOverlay.classList.contains("hidden")) {
                closeModal();
            }
        }
    });

    // Global link delegation for data-external-url (BoyGR Standard)
    document.addEventListener("click", (e) => {
        const link = e.target && e.target.closest ? e.target.closest("[data-external-url]") : null;
        if (link) {
            e.preventDefault();
            const url = link.dataset.externalUrl || link.getAttribute("href");
            if (url) {
                vscode.postMessage({ type: "openExternal", url });
            }
        }
    });

    // Settings Modal state & rendering (Antigravity Switcher UX)
    let settingsDraft = null;

    function openSettingsModal() {
        const prefs = state.preferences || {};
        settingsDraft = {
            theme: prefs.theme || "vscode",
            language: prefs.language || "auto",
            defaultRulesBudget: prefs.defaultRulesBudget || 20000,
            ruleFileSizeLimitBytes: prefs.ruleFileSizeLimitBytes || 24000,
            showStatusBarItem: prefs.showStatusBarItem !== false,
            enableMultiAgentSync: prefs.enableMultiAgentSync !== false,
            customAntigravityPath: prefs.customAntigravityPath || "",
        };
        renderSettingsModal();
    }

    function closeSettingsModal() {
        settingsDraft = null;
        const root = document.getElementById("settings-modal-root");
        if (root) {
            root.innerHTML = "";
        }
    }

    function renderSettingsModal() {
        const root = document.getElementById("settings-modal-root");
        if (!root || !settingsDraft) return;

        root.innerHTML = `
            <div class="settings-backdrop" id="settings-backdrop">
                <section class="settings-panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(t("settingsTitle"))}">
                    <header class="settings-header">
                        <h2>${escapeHtml(t("settingsTitle"))}</h2>
                        <button type="button" class="icon-btn" id="btn-close-settings" aria-label="${escapeHtml(t("cancel"))}" title="${escapeHtml(t("cancel"))}">×</button>
                    </header>
                    <div class="settings-body">
                        <!-- Group 1: Appearance & Language -->
                        <div class="settings-group">
                            <h3>${escapeHtml(t("appearanceGroup"))}</h3>
                            <label class="field">
                                <span>${escapeHtml(t("themeLabel"))}</span>
                                <select id="setting-theme">
                                    <option value="vscode" ${settingsDraft.theme === "vscode" || !settingsDraft.theme ? "selected" : ""}>${escapeHtml(t("followVsCode"))}</option>
                                    <option value="dark" ${settingsDraft.theme === "dark" ? "selected" : ""}>${escapeHtml(t("dark"))}</option>
                                    <option value="light" ${settingsDraft.theme === "light" ? "selected" : ""}>${escapeHtml(t("light"))}</option>
                                    <option value="system" ${settingsDraft.theme === "system" ? "selected" : ""}>${escapeHtml(t("system"))}</option>
                                </select>
                            </label>
                            <label class="field">
                                <span>${escapeHtml(t("languageLabel"))}</span>
                                <select id="setting-language">
                                    <option value="auto" ${settingsDraft.language === "auto" ? "selected" : ""}>${escapeHtml(t("langAuto"))}</option>
                                    <option value="en" ${settingsDraft.language === "en" ? "selected" : ""}>${escapeHtml(t("langEn"))}</option>
                                    <option value="id" ${settingsDraft.language === "id" ? "selected" : ""}>${escapeHtml(t("langId"))}</option>
                                </select>
                            </label>
                        </div>

                        <!-- Group 2: Governance & Limits -->
                        <div class="settings-group">
                            <h3>${escapeHtml(t("governanceGroup"))}</h3>
                            <label class="field">
                                <span>${escapeHtml(t("budgetLabel"))}</span>
                                <input type="number" id="setting-budget" value="${settingsDraft.defaultRulesBudget}" min="1000" step="1000" />
                                <div class="field-hint">${escapeHtml(t("budgetSettingHint"))}</div>
                            </label>
                            <label class="field">
                                <span>${escapeHtml(t("fileCapLabel"))}</span>
                                <input type="number" id="setting-filecap" value="${settingsDraft.ruleFileSizeLimitBytes}" min="1000" step="1000" />
                                <div class="field-hint">${escapeHtml(t("fileCapSettingHint"))}</div>
                            </label>
                            <div class="check-setting-wrap">
                                <label class="check-row">
                                    <input type="checkbox" id="setting-statusbar" ${settingsDraft.showStatusBarItem ? "checked" : ""} />
                                    <span class="check-label-text">${escapeHtml(t("showStatusBarLabel"))}</span>
                                </label>
                                <div class="field-hint">${escapeHtml(t("showStatusBarHint"))}</div>
                            </div>
                            <div class="check-setting-wrap">
                                <label class="check-row">
                                    <input type="checkbox" id="setting-multisync" ${settingsDraft.enableMultiAgentSync ? "checked" : ""} />
                                    <span class="check-label-text">${escapeHtml(t("multiAgentSyncLabel"))}</span>
                                </label>
                                <div class="field-hint">${escapeHtml(t("multiAgentSyncHint"))}</div>
                            </div>
                            <label class="field" style="margin-top: 10px;">
                                <span>${escapeHtml(t("customPathLabel"))}</span>
                                <input type="text" id="setting-custompath" value="${escapeHtml(settingsDraft.customAntigravityPath)}" placeholder="~/.gemini" />
                                <div class="field-hint">${escapeHtml(t("customPathHint"))}</div>
                            </label>
                        </div>

                        <!-- Group 3: About -->
                        <div class="settings-group about-group">
                            <h3>
                                ${escapeHtml(t("about"))}
                            </h3>

                            ${state.meta?.iconUri ? `
                            <div style="text-align: center; margin: 8px 0 16px 0;">
                                <img src="${escapeHtml(state.meta.iconUri)}" width="64" height="64" style="border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.35); vertical-align: middle;" alt="Logo" />
                            </div>` : ""}

                            <div class="about-row">
                                <span>
                                    Antigravity Customization Manager
                                </span>

                                <span>
                                    v${escapeHtml(state.meta?.version || "0.1.0")}
                                </span>
                            </div>

                            <div class="about-row">
                                <span>
                                    ${escapeHtml(t("developer"))}
                                </span>

                                <strong>
                                    ${escapeHtml(state.meta?.developer || "Boy Gilang Ramadhan (BoyGR)")}
                                </strong>
                            </div>

                            <div class="about-row">
                                <span>
                                    ${escapeHtml(t("website"))}
                                </span>

                                <a
                                    href="${escapeHtml(state.meta?.website || "https://boygr.com")}"
                                    data-external-url="${escapeHtml(state.meta?.website || "https://boygr.com")}"
                                >
                                    boygr.com
                                </a>
                            </div>
                        </div>

                        <div class="settings-note">
                            ${escapeHtml(t("settingsHint"))}
                        </div>
                    </div>
                    <footer class="settings-footer">
                        <button type="button" class="btn btn-reset" id="btn-reset-settings" title="${escapeHtml(t("resetToDefault"))}">
                            ${escapeHtml(t("resetToDefault"))}
                        </button>

                        <div class="settings-footer-actions">
                            <button type="button" class="btn" id="btn-cancel-settings">${escapeHtml(t("cancel"))}</button>
                            <button type="button" class="btn primary" id="btn-save-settings">${escapeHtml(t("save"))}</button>
                        </div>
                    </footer>
                </section>
            </div>
        `;

        document.getElementById("btn-close-settings")?.addEventListener("click", closeSettingsModal);
        document.getElementById("btn-cancel-settings")?.addEventListener("click", closeSettingsModal);
        document.getElementById("settings-backdrop")?.addEventListener("click", (e) => {
            if (e.target.id === "settings-backdrop") {
                closeSettingsModal();
            }
        });
        document.getElementById("btn-reset-settings")?.addEventListener("click", () => {
            resetSettingsToDefault();
        });
        document.getElementById("btn-save-settings")?.addEventListener("click", () => {
            const themeInput = document.getElementById("setting-theme");
            const langInput = document.getElementById("setting-language");
            const budgetInput = document.getElementById("setting-budget");
            const fileCapInput = document.getElementById("setting-filecap");
            const statusBarInput = document.getElementById("setting-statusbar");
            const multiSyncInput = document.getElementById("setting-multisync");
            const customPathInput = document.getElementById("setting-custompath");

            const selectedTheme = themeInput ? themeInput.value : "vscode";
            const selectedLang = langInput ? langInput.value : "auto";
            const budgetVal = budgetInput ? parseInt(budgetInput.value, 10) : 20000;
            const fileCapVal = fileCapInput ? parseInt(fileCapInput.value, 10) : 24000;
            const statusBarVal = statusBarInput ? statusBarInput.checked : true;
            const multiSyncVal = multiSyncInput ? multiSyncInput.checked : true;
            const customPathVal = customPathInput ? customPathInput.value.trim() : "";

            vscode.postMessage({
                type: "saveSettings",
                settings: {
                    theme: selectedTheme,
                    language: selectedLang,
                    defaultRulesBudget: budgetVal,
                    ruleFileSizeLimitBytes: fileCapVal,
                    showStatusBarItem: statusBarVal,
                    enableMultiAgentSync: multiSyncVal,
                    customAntigravityPath: customPathVal,
                }
            });

            // Immediately reflect theme and language change locally
            state.preferences.theme = selectedTheme;
            applyTheme();

            if (selectedLang === "id") {
                state.preferences.effectiveLanguage = "id";
            } else if (selectedLang === "en") {
                state.preferences.effectiveLanguage = "en";
            }
            state.preferences.language = selectedLang;
            state.preferences.defaultRulesBudget = budgetVal;
            state.preferences.ruleFileSizeLimitBytes = fileCapVal;
            state.preferences.showStatusBarItem = statusBarVal;
            state.preferences.enableMultiAgentSync = multiSyncVal;
            state.preferences.customAntigravityPath = customPathVal;

            updateLanguageUi();
            renderRules();
            renderSkills();
            renderBudget();
            closeSettingsModal();
            showToast(t("settingsSaved"), "success");
        });
    }

    function resetSettingsToDefault() {
        settingsDraft = {
            theme: "vscode",
            language: "auto",
            defaultRulesBudget: 20000,
            ruleFileSizeLimitBytes: 24000,
            showStatusBarItem: true,
            enableMultiAgentSync: true,
            customAntigravityPath: "",
        };
        renderSettingsModal();
        // Show feedback notice after re-render
        const notice = document.createElement("div");
        notice.className = "settings-reset-notice";
        notice.textContent = t("resetSettingsNotice");
        const body = document.querySelector(".settings-body");
        if (body) {
            body.prepend(notice);
            setTimeout(() => notice.remove(), 4000);
        }
    }

    // Tabs
    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");
            state.activeTab = tabId;

            tabButtons.forEach((b) => b.classList.remove("active"));
            tabPanes.forEach((p) => p.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(tabId).classList.add("active");
        });
    });

    // Search & Filter
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            state.filterQuery = e.target.value.toLowerCase().trim();
            renderRules();
            renderSkills();
        });
    }

    if (rulesScopeFilter) {
        rulesScopeFilter.addEventListener("change", (e) => {
            state.rulesScope = e.target.value;
            renderRules();
        });
    }

    if (skillsScopeFilter) {
        skillsScopeFilter.addEventListener("change", (e) => {
            state.skillsScope = e.target.value;
            renderSkills();
        });
    }

    if (btnOpenSkillsFolder) {
        btnOpenSkillsFolder.addEventListener("click", () => {
            if (state.paths && state.paths.workspaceSkillsDir) {
                vscode.postMessage({
                    type: "revealInOS",
                    filePath: state.paths.workspaceSkillsDir,
                });
            } else if (state.paths && state.paths.builtinSkillsDir) {
                vscode.postMessage({
                    type: "revealInOS",
                    filePath: state.paths.builtinSkillsDir,
                });
            }
        });
    }

    // Dialog: New Rule
    if (btnNewRule) {
        btnNewRule.addEventListener("click", () => {
            let templateOptions = `<option value="">(Blank Rule)</option>`;
            (state.templates || []).forEach((tmpl) => {
                templateOptions += `<option value="${tmpl.id}">${tmpl.name}</option>`;
            });

            const bodyHtml = `
                <div class="form-group">
                    <label>${t("ruleScopePrompt")}</label>
                    <select id="new-rule-scope" class="form-control">
                        <option value="workspace">${t("scopeWorkspace")} (.agents/rules/)</option>
                        <option value="global">${t("scopeGlobal")} (~/.gemini/config/rules/)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>${t("ruleTemplatePrompt")}</label>
                    <select id="new-rule-template" class="form-control">
                        ${templateOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>${t("ruleNamePrompt")}</label>
                    <input type="text" id="new-rule-name" class="form-control" placeholder="my-guidelines">
                </div>
                <div class="form-group">
                    <label>Initial Markdown Content</label>
                    <textarea id="new-rule-content" class="form-control"># My Guidelines\n\n- State rule guidelines here.</textarea>
                </div>
            `;

            showModal(t("btnNewRule"), bodyHtml, [
                { label: t("cancel"), onClick: closeModal },
                {
                    label: t("create"),
                    primary: true,
                    onClick: () => {
                        const scope = document.getElementById("new-rule-scope").value;
                        const fileName = document.getElementById("new-rule-name").value.trim();
                        const content = document.getElementById("new-rule-content").value;

                        if (!fileName) {
                            showToast(t("fileNameRequired"), "warning");
                            return;
                        }

                        vscode.postMessage({
                            type: "createRule",
                            scope,
                            fileName,
                            content,
                        });
                        closeModal();
                    },
                },
            ]);

            const templateSelect = document.getElementById("new-rule-template");
            const contentArea = document.getElementById("new-rule-content");
            templateSelect.addEventListener("change", () => {
                const selected = state.templates.find((x) => x.id === templateSelect.value);
                if (selected) {
                    contentArea.value = selected.content;
                }
            });
        });
    }

    // Dialog: New Skill Wizard
    if (btnNewSkill) {
        btnNewSkill.addEventListener("click", () => {
            const bodyHtml = `
                <div class="form-group">
                    <label>${t("skillNamePrompt")}</label>
                    <input type="text" id="new-skill-name" class="form-control" placeholder="e.g. database-migration">
                </div>
                <div class="form-group">
                    <label>${t("skillDescPrompt")}</label>
                    <textarea id="new-skill-desc" class="form-control" placeholder="Use this skill when the user asks to run database migrations or schema adjustments."></textarea>
                </div>
                <div class="form-group">
                    <label>Subdirectories to Scaffold</label>
                    <div class="checkbox-group">
                        <input type="checkbox" id="chk-scripts" checked>
                        <label for="chk-scripts">${t("includeScripts")}</label>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" id="chk-references" checked>
                        <label for="chk-references">${t("includeReferences")}</label>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" id="chk-examples">
                        <label for="chk-examples">${t("includeExamples")}</label>
                    </div>
                </div>
            `;

            showModal(t("btnNewSkill"), bodyHtml, [
                { label: t("cancel"), onClick: closeModal },
                {
                    label: t("create"),
                    primary: true,
                    onClick: () => {
                        const name = document.getElementById("new-skill-name").value.trim();
                        const description = document.getElementById("new-skill-desc").value.trim();
                        const createScriptsFolder = document.getElementById("chk-scripts").checked;
                        const createReferencesFolder = document.getElementById("chk-references").checked;
                        const createExamplesFolder = document.getElementById("chk-examples").checked;

                        if (!name || !description) {
                            showToast(t("skillRequired"), "warning");
                            return;
                        }

                        vscode.postMessage({
                            type: "createSkill",
                            name,
                            description,
                            createScriptsFolder,
                            createReferencesFolder,
                            createExamplesFolder,
                        });
                        closeModal();
                    },
                },
            ]);
        });
    }

    // Dialog: Multi-Agent Sync
    if (btnSyncAgents) {
        btnSyncAgents.addEventListener("click", () => {
            let ruleOptions = "";
            state.rules.forEach((r) => {
                ruleOptions += `<option value="${r.filePath}">[${r.scope}] ${r.name} - ${r.title}</option>`;
            });

            if (!ruleOptions) {
                showToast(t("noRulesToSync"), "warning");
                return;
            }

            const bodyHtml = `
                <div class="form-group">
                    <label>Select Source Rule</label>
                    <select id="sync-source-rule" class="form-control">
                        ${ruleOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>${t("syncTargetAgent")}</label>
                    <select id="sync-target-agent" class="form-control">
                        <option value="agents-md">AGENTS.md (Universal Standard - Antigravity & Codex)</option>
                        <option value="codex-md">CODEX.md (OpenAI Codex)</option>
                        <option value="cursorrules">.cursorrules (Cursor)</option>
                        <option value="claude-md">CLAUDE.md (Claude Code)</option>
                        <option value="copilot-instructions">.github/copilot-instructions.md (Copilot)</option>
                    </select>
                </div>
                <p class="metric-hint">
                    Copies this rule into the target agent configuration file in the project workspace, ensuring multi-agent consistency.
                </p>
            `;

            showModal(t("btnSyncAgents"), bodyHtml, [
                { label: t("cancel"), onClick: closeModal },
                {
                    label: t("sync"),
                    primary: true,
                    onClick: () => {
                        const sourcePath = document.getElementById("sync-source-rule").value;
                        const targetAgent = document.getElementById("sync-target-agent").value;

                        vscode.postMessage({
                            type: "exportMultiAgentRule",
                            sourcePath,
                            targetAgent,
                        });
                        closeModal();
                    },
                },
            ]);
        });
    }

    // Rendering Rules
    function renderRules() {
        if (!rulesList) return;

        let filtered = state.rules;

        if (state.rulesScope === "workspace") {
            filtered = filtered.filter(
                (r) => r.scope === "workspace-root" || r.scope === "workspace-modular"
            );
        } else if (state.rulesScope === "global") {
            filtered = filtered.filter((r) => r.scope === "global");
        }

        if (state.filterQuery) {
            filtered = filtered.filter(
                (r) =>
                    r.name.toLowerCase().includes(state.filterQuery) ||
                    r.title.toLowerCase().includes(state.filterQuery) ||
                    r.contentPreview.toLowerCase().includes(state.filterQuery)
            );
        }

        if (filtered.length === 0) {
            rulesList.innerHTML = `<div class="skeleton-placeholder">${escapeHtml(t("noRulesMatch"))}</div>`;
            return;
        }

        rulesList.innerHTML = "";
        filtered.forEach((rule) => {
            const card = document.createElement("div");
            card.className = `item-card ${!rule.isEnabled ? "disabled" : ""} ${
                rule.isOverLimit ? "overlimit" : ""
            }`;

            const badgeScopeClass =
                rule.scope === "global" ? "badge-global" : "badge-workspace";
            const badgeScopeLabel =
                rule.scope === "global" ? t("scopeGlobal") : t("scopeWorkspace");

            const sizeKb = (rule.sizeBytes / 1024).toFixed(1);

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-title-group">
                        <label class="switch" title="Toggle Enable/Disable">
                            <input type="checkbox" class="rule-toggle" data-path="${rule.filePath}" ${
                                rule.isEnabled ? "checked" : ""
                            }>
                            <span class="slider"></span>
                        </label>
                        <span class="card-title" title="${rule.filePath}">${rule.title}</span>
                    </div>
                    <div class="card-badges">
                        <span class="badge ${badgeScopeClass}">${badgeScopeLabel}</span>
                        ${
                            rule.isOverLimit
                                ? `<span class="badge badge-warning" title="Exceeds 24 KB per-file limit!">>24 KB</span>`
                                : ""
                        }
                    </div>
                </div>
                <div class="card-meta">
                    <span class="card-meta-item">📄 ${rule.name}</span>
                    <span class="card-meta-item">⚖️ ${sizeKb} KB</span>
                    <span class="card-meta-item">🔤 ~${rule.estimatedTokens} tok</span>
                </div>
                <div class="card-preview">${rule.contentPreview}</div>
                <div class="card-actions">
                    <button class="action-btn btn-open" data-path="${rule.filePath}">${t("openInEditor")}</button>
                    <button class="action-btn btn-delete danger" data-path="${rule.filePath}">${t("delete")}</button>
                </div>
            `;

            // Toggle switch handler
            const toggleInput = card.querySelector(".rule-toggle");
            toggleInput.addEventListener("change", () => {
                vscode.postMessage({
                    type: "toggleRule",
                    filePath: rule.filePath,
                });
            });

            // Open in Editor
            card.querySelector(".btn-open").addEventListener("click", () => {
                vscode.postMessage({
                    type: "openFile",
                    filePath: rule.filePath,
                });
            });

            // Delete
            card.querySelector(".btn-delete").addEventListener("click", () => {
                vscode.postMessage({
                    type: "deleteRule",
                    filePath: rule.filePath,
                });
            });

            rulesList.appendChild(card);
        });
    }

    // Rendering Skills
    function renderSkills() {
        if (!skillsList) return;

        let filtered = state.skills;

        if (state.skillsScope === "workspace") {
            filtered = filtered.filter((s) => s.tier === "workspace");
        } else if (state.skillsScope === "global") {
            filtered = filtered.filter((s) => s.tier === "plugin");
        } else if (state.skillsScope === "builtin") {
            filtered = filtered.filter((s) => s.tier === "builtin");
        }

        if (state.filterQuery) {
            filtered = filtered.filter(
                (s) =>
                    s.name.toLowerCase().includes(state.filterQuery) ||
                    s.description.toLowerCase().includes(state.filterQuery)
            );
        }

        if (filtered.length === 0) {
            skillsList.innerHTML = `<div class="skeleton-placeholder">${escapeHtml(t("noSkillsMatch"))}</div>`;
            return;
        }

        skillsList.innerHTML = "";
        filtered.forEach((skill) => {
            const card = document.createElement("div");
            card.className = `item-card ${skill.isShadowed ? "disabled" : ""}`;

            let tierBadge = `<span class="badge badge-workspace">${t("scopeWorkspace")}</span>`;
            if (skill.tier === "plugin") {
                tierBadge = `<span class="badge badge-global">Plugin</span>`;
            } else if (skill.tier === "builtin") {
                tierBadge = `<span class="badge badge-builtin">${t("scopeBuiltin")}</span>`;
            }

            const shadowedBadge = skill.isShadowed
                ? `<span class="badge badge-shadowed" title="Shadowed by ${skill.shadowedByTier} tier">${t("shadowed")}</span>`
                : "";

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-title-group">
                        <span class="card-title">${skill.name}</span>
                    </div>
                    <div class="card-badges">
                        ${shadowedBadge}
                        ${tierBadge}
                    </div>
                </div>
                <div class="card-meta">
                    <span class="card-meta-item">📁 ${skill.tier}</span>
                    <span class="card-meta-item">🔤 ~${skill.descriptionTokens} desc tok</span>
                    <span class="card-meta-item">${skill.hasScripts ? "⚡ scripts" : ""}</span>
                    <span class="card-meta-item">${skill.hasReferences ? "📖 refs" : ""}</span>
                </div>
                <div class="card-preview">${skill.description}</div>
                <div class="card-actions">
                    <button class="action-btn btn-open" data-path="${skill.skillFilePath}">${t("openInEditor")}</button>
                    ${
                        skill.tier !== "workspace"
                            ? `<button class="action-btn btn-fork" data-path="${skill.folderPath}">${t("forkToWorkspace")}</button>`
                            : `<button class="action-btn btn-delete-skill danger" data-path="${skill.folderPath}">${t("delete")}</button>`
                    }
                </div>
            `;

            card.querySelector(".btn-open").addEventListener("click", () => {
                vscode.postMessage({
                    type: "openFile",
                    filePath: skill.skillFilePath,
                });
            });

            const forkBtn = card.querySelector(".btn-fork");
            if (forkBtn) {
                forkBtn.addEventListener("click", () => {
                    vscode.postMessage({
                        type: "forkSkill",
                        sourcePath: skill.folderPath,
                    });
                });
            }

            const deleteBtn = card.querySelector(".btn-delete-skill");
            if (deleteBtn) {
                deleteBtn.addEventListener("click", () => {
                    vscode.postMessage({
                        type: "deleteSkill",
                        folderPath: skill.folderPath,
                    });
                });
            }

            skillsList.appendChild(card);
        });
    }

    // Rendering Budget Diagnostics & Stats Bar
    function renderBudget() {
        if (!state.budget) return;

        const b = state.budget;

        // Update Top Stats Bar (BoyGR Pattern)
        if (statsBar) {
            const tokenDisplay =
                b.totalRulesTokens >= 1000
                    ? `${(b.totalRulesTokens / 1000).toFixed(1)}k`
                    : `${b.totalRulesTokens}`;
            statsBar.innerHTML = `<span>${b.activeRulesCount} Active Rules (${tokenDisplay} tok) • ${b.totalSkills} Skills</span><span>${b.budgetPercent}% Budget</span>`;
        }

        const meterFill = document.getElementById("budget-meter-fill");
        const meterUsed = document.getElementById("meter-used");
        const meterMax = document.getElementById("meter-max");
        const budgetBadge = document.getElementById("budget-badge");
        const fileLimitBadge = document.getElementById("file-limit-badge");
        const fileLimitViolations = document.getElementById("file-limit-violations");
        const statWorkspaceSkills = document.getElementById("stat-workspace-skills");
        const statPluginSkills = document.getElementById("stat-plugin-skills");
        const statBuiltinSkills = document.getElementById("stat-builtin-skills");
        const statSkillDescTokens = document.getElementById("stat-skill-desc-tokens");

        if (meterFill) {
            meterFill.style.width = `${b.budgetPercent}%`;
            if (b.isOverBudget) {
                meterFill.style.backgroundColor = "var(--accent-red)";
            } else if (b.budgetPercent > 75) {
                meterFill.style.backgroundColor = "var(--accent-amber)";
            } else {
                meterFill.style.backgroundColor = "var(--accent-green)";
            }
        }

        if (meterUsed) {
            meterUsed.textContent = `${b.totalRulesTokens.toLocaleString()} tokens (${b.budgetPercent}%)`;
        }
        if (meterMax) {
            meterMax.textContent = `${b.maxRulesBudget.toLocaleString()} max`;
        }

        if (budgetBadge) {
            if (b.isOverBudget) {
                budgetBadge.className = "badge badge-warning";
                budgetBadge.textContent = t("exceededStatus");
            } else if (b.budgetPercent > 75) {
                budgetBadge.className = "badge badge-shadowed";
                budgetBadge.textContent = t("warningStatus");
            } else {
                budgetBadge.className = "badge badge-workspace";
                budgetBadge.textContent = t("safeStatus");
            }
        }

        if (fileLimitBadge) {
            if (b.rulesOverFileLimit > 0) {
                fileLimitBadge.className = "badge badge-warning";
                fileLimitBadge.textContent = `${b.rulesOverFileLimit} Over Limit`;
            } else {
                fileLimitBadge.className = "badge badge-workspace";
                fileLimitBadge.textContent = `0 Violations`;
            }
        }

        if (fileLimitViolations) {
            fileLimitViolations.innerHTML = "";
            const overRules = state.rules.filter((r) => r.isOverLimit);
            overRules.forEach((r) => {
                const item = document.createElement("div");
                item.className = "metric-hint";
                item.style.color = "var(--accent-red)";
                item.textContent = `⚠️ ${r.name} (${(r.sizeBytes / 1024).toFixed(1)} KB > 24 KB)`;
                fileLimitViolations.appendChild(item);
            });
        }

        if (statWorkspaceSkills) statWorkspaceSkills.textContent = b.workspaceSkillsCount;
        if (statPluginSkills) statPluginSkills.textContent = b.pluginSkillsCount;
        if (statBuiltinSkills) statBuiltinSkills.textContent = b.builtinSkillsCount;
        if (statSkillDescTokens) statSkillDescTokens.textContent = b.totalSkillsDescriptionTokens;
    }

    // Message handler from extension backend
    window.addEventListener("message", (event) => {
        const msg = event.data;
        if (msg.type === "stateUpdate") {
            state.rules = msg.state.rules || [];
            state.skills = msg.state.skills || [];
            state.budget = msg.state.budget || null;
            state.paths = msg.state.paths || null;
            state.preferences = msg.state.preferences || { theme: "vscode", effectiveLanguage: "en" };
            state.templates = msg.templates || [];
            if (msg.meta) {
                state.meta = Object.assign({}, state.meta, msg.meta);
            }

            applyTheme();
            updateLanguageUi();
            renderRules();
            renderSkills();
            renderBudget();
        } else if (msg.type === "openSettings") {
            openSettingsModal();
        } else if (msg.type === "actionError") {
            showToast(msg.message, "error");
        }
    });

    // Initial theme application and system theme change listener
    applyTheme();
    try {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
            if (state.preferences?.theme === "system") {
                applyTheme();
            }
        });
    } catch {
        // Ignore listener error
    }

    // Notify backend ready
    vscode.postMessage({ type: "ready" });
})();
