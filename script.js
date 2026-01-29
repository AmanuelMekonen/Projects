const SECTION_IDS = [
  "about",
  "resume",
  "projects",
  "create-lab",
  "curo-research",
  "personal",
  "contact",
];
const INDENT = "    ";
const CREATE_LAB_PROJECTS = [
  {
    title: "Create Lab",
    summary: "Add your Create Lab projects here.",
  },
];
const CURO_RESEARCH_PROJECTS = [
  {
    title: "Curo Research",
    summary: "Add your Curo Research projects here.",
  },
];
const PERSONAL_PROJECTS = [
  {
    title: "Personal Project",
    summary: "Add your personal projects here.",
  },
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const t = {
  comment: (text) => `<span class="tok-comment">${escapeHtml(text)}</span>`,
  string: (text) => `<span class="tok-string">"${escapeHtml(text)}"</span>`,
  property: (text) => `<span class="tok-property">"${escapeHtml(text)}"</span>`,
  punctuation: (text) => `<span class="tok-punctuation">${escapeHtml(text)}</span>`,
  variable: (text) => `<span class="tok-variable">${escapeHtml(text)}</span>`,
  operator: (text) => `<span class="tok-operator">${escapeHtml(text)}</span>`,
};

function line(content) {
  return `<span class="line">${content}</span>`;
}

function setActiveSection(sectionId) {
  const target = document.querySelector(
    `.editor-section[data-section="${sectionId}"]`
  );
  if (!target) return;

  updateBreadcrumb(sectionId);

  document.querySelectorAll(".editor-section").forEach((section) => {
    section.classList.toggle(
      "is-active",
      section.dataset.section === sectionId
    );
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    const isActive = tab.dataset.section === sectionId;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  document.querySelectorAll(".sidebar-file").forEach((file) => {
    file.classList.toggle("is-active", file.dataset.section === sectionId);
  });

  const editor = document.querySelector(".editor");
  if (editor) editor.scrollTop = 0;
}

function updateBreadcrumb(sectionId) {
  const breadcrumb = document.getElementById("breadcrumbText");
  if (!breadcrumb) return;

  const tabLabel = document.querySelector(
    `.tab[data-section="${sectionId}"] .tab-label`
  );
  const sidebarLabel = document
    .querySelector(`.sidebar-file[data-section="${sectionId}"]`)
    ?.querySelector("span:last-child");
  const label =
    tabLabel?.textContent?.trim() ||
    sidebarLabel?.textContent?.trim() ||
    `${sectionId}.py`;
  const download =
    sectionId === "resume"
      ? '<a class="breadcrumb-download" href="Resume.pdf" download aria-label="Download Resume.pdf" title="Download Resume.pdf"><span class="codicon codicon-download" aria-hidden="true"></span></a>'
      : "";

  breadcrumb.innerHTML = `<span class="breadcrumb-label">${escapeHtml(
    label
  )}</span>${download}`;
}

function getSectionMeta(sectionId) {
  const portfolioEntry = document.querySelector(
    `.sidebar-section[data-section-id="portfolio"] .sidebar-file[data-section="${sectionId}"]`
  );
  const anyEntry = document.querySelector(
    `.sidebar-file[data-section="${sectionId}"]`
  );
  const entry = portfolioEntry || anyEntry;
  const label =
    entry?.querySelector("span:last-child")?.textContent?.trim() ||
    `${sectionId}.py`;
  const icon = entry?.querySelector(".file-icon");
  const iconMarkup =
    icon?.outerHTML ||
    '<span class="file-icon codicon codicon-file" aria-hidden="true"></span>';

  return { label, iconMarkup };
}

function bindTab(tab) {
  tab.addEventListener("click", () => {
    openSection(tab.dataset.section);
  });
}

function bindSidebarFile(button) {
  button.addEventListener("click", () => {
    openSection(button.dataset.section);
  });
}

function bindSectionSwitchers() {
  document.querySelectorAll(".tab").forEach((tab) => bindTab(tab));
  document.querySelectorAll(".sidebar-file").forEach((button) =>
    bindSidebarFile(button)
  );
}

function ensureTab(sectionId) {
  const tabStrip = document.querySelector(".tab-strip");
  if (!tabStrip) return null;

  let tab = tabStrip.querySelector(`.tab[data-section="${sectionId}"]`);
  if (tab) return tab;

  const meta = getSectionMeta(sectionId);
  tab = document.createElement("button");
  tab.className = "tab";
  tab.dataset.section = sectionId;
  tab.id = `tab-${sectionId}`;
  tab.setAttribute("role", "tab");
  tab.setAttribute("aria-selected", "false");
  tab.type = "button";
  tab.innerHTML = `${meta.iconMarkup}<span class="tab-label">${escapeHtml(
    meta.label
  )}</span><span class="tab-close codicon codicon-close" aria-hidden="true"></span>`;
  tabStrip.appendChild(tab);

  bindTab(tab);
  const close = tab.querySelector(".tab-close");
  if (close) bindTabClose(close);

  return tab;
}

function ensureOpenEditorEntry(sectionId) {
  const openEditorsSection = document.querySelector("#sidebar-open-editors");
  if (!openEditorsSection) return null;

  let entry = openEditorsSection.querySelector(
    `.sidebar-file[data-section="${sectionId}"]`
  );
  if (entry) return entry;

  const meta = getSectionMeta(sectionId);
  entry = document.createElement("button");
  entry.className = "sidebar-file";
  entry.dataset.section = sectionId;
  entry.type = "button";
  entry.innerHTML = `${meta.iconMarkup}<span>${escapeHtml(meta.label)}</span>`;
  openEditorsSection.appendChild(entry);

  bindSidebarFile(entry);
  return entry;
}

function openSection(sectionId) {
  if (!sectionId) return;

  const target = document.querySelector(
    `.editor-section[data-section="${sectionId}"]`
  );
  if (!target) return;

  ensureTab(sectionId);
  ensureOpenEditorEntry(sectionId);
  setActiveSection(sectionId);
}

function clearActiveState() {
  document.querySelectorAll(".editor-section").forEach((section) => {
    section.classList.remove("is-active");
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("is-active");
    tab.setAttribute("aria-selected", "false");
  });

  document.querySelectorAll(".sidebar-file").forEach((file) => {
    file.classList.remove("is-active");
  });

  const breadcrumb = document.getElementById("breadcrumbText");
  if (breadcrumb) breadcrumb.textContent = "";
}

function findNextTab(tab) {
  let next = tab?.nextElementSibling;
  while (next && !next.classList.contains("tab")) {
    next = next.nextElementSibling;
  }

  if (next) return next;

  let prev = tab?.previousElementSibling;
  while (prev && !prev.classList.contains("tab")) {
    prev = prev.previousElementSibling;
  }

  return prev || null;
}

function removeOpenEditorEntry(sectionId) {
  const openEditorsSection = document.querySelector(
    '.sidebar-section[data-section-id="open-editors"]'
  );
  const entry = openEditorsSection?.querySelector(
    `.sidebar-file[data-section="${sectionId}"]`
  );
  if (entry) entry.remove();
}

function closeTab(tab) {
  if (!tab) return;

  const sectionId = tab.dataset.section;
  const wasActive = tab.classList.contains("is-active");
  const nextTab = findNextTab(tab);

  tab.remove();
  removeOpenEditorEntry(sectionId);

  if (!wasActive) return;

  if (nextTab?.dataset.section) {
    openSection(nextTab.dataset.section);
  } else {
    clearActiveState();
  }
}

function bindTabClose(close) {
  close.addEventListener("click", (event) => {
    event.stopPropagation();
    const tab = close.closest(".tab");
    closeTab(tab);
  });
}

function bindTabClosers() {
  document.querySelectorAll(".tab-close").forEach((close) => {
    bindTabClose(close);
  });
}

const SIDEBAR_STORAGE_KEY = "sidebarSectionState";

function getSidebarState() {
  try {
    return JSON.parse(localStorage.getItem(SIDEBAR_STORAGE_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function setSidebarState(state) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Ignore storage errors (private mode, blocked storage).
  }
}

function setSectionCollapsed(section, collapsed) {
  section.classList.toggle("is-collapsed", collapsed);
  const header = section.querySelector(".sidebar-section-header");
  if (header) {
    header.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }
  const chevron = section.querySelector(".sidebar-section-chevron");
  if (chevron) {
    chevron.classList.remove("codicon-chevron-right", "codicon-chevron-down");
    chevron.classList.add(
      collapsed ? "codicon-chevron-right" : "codicon-chevron-down"
    );
  }
}

function bindSidebarSectionToggles() {
  const state = getSidebarState();

  document.querySelectorAll(".sidebar-section").forEach((section) => {
    const id = section.dataset.sectionId;
    const header = section.querySelector(".sidebar-section-header");
    if (!header) return;

    const defaultCollapsed = section.dataset.default === "collapsed";
    const stored = typeof state[id] === "boolean" ? state[id] : undefined;
    const collapsed = stored ?? defaultCollapsed;

    setSectionCollapsed(section, collapsed);

    header.addEventListener("click", () => {
      const next = !section.classList.contains("is-collapsed");
      setSectionCollapsed(section, next);
      if (id) {
        state[id] = next;
        setSidebarState(state);
      }
    });
  });
}

function buildPlaceholderImage(title) {
  const label = String(title || "Project");
  const safeLabel = escapeHtml(label);
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">',
    '<rect width="960" height="540" fill="#141414"/>',
    '<rect x="24" y="24" width="912" height="492" rx="18" fill="#1f1f1f" stroke="#2f2f2f" stroke-width="2"/>',
    `<text x="480" y="270" fill="#7fbfff" font-size="28" font-family="Segoe UI, Arial, sans-serif" text-anchor="middle">${safeLabel}</text>`,
    '<text x="480" y="310" fill="#9aa0a6" font-size="16" font-family="Segoe UI, Arial, sans-serif" text-anchor="middle">preview</text>',
    "</svg>",
  ].join("");

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildNotebookMarkdownCell(title) {
  return [
    '<div class="nb-cell nb-markdown" role="listitem">',
    '  <div class="nb-cell-gutter"><span class="nb-prompt" aria-hidden="true"></span></div>',
    '  <div class="nb-cell-body">',
    '    <div class="nb-markdown-content">',
    `      <h3>${escapeHtml(title || "Untitled Project")}</h3>`,
    "    </div>",
    "  </div>",
    "</div>",
  ].join("\n");
}

function buildNotebookCodeCell(summary) {
  const codeLine = `${t.variable("description")} ${t.operator("=")} ${t.string(
    summary || ""
  )}`;
  return [
    '<div class="nb-cell nb-code" role="listitem">',
    '  <div class="nb-cell-gutter"><span class="nb-prompt">In&nbsp;[&nbsp;]:</span></div>',
    '  <div class="nb-cell-body">',
    `    <pre class="nb-code"><code>${codeLine}</code></pre>`,
    "  </div>",
    "</div>",
  ].join("\n");
}

function buildNotebookOutputCell(title) {
  const placeholder = buildPlaceholderImage(title);
  return [
    '<div class="nb-output" role="listitem">',
    '  <div class="nb-cell-gutter"><span class="nb-prompt">Out[&nbsp;]:</span></div>',
    '  <div class="nb-cell-body">',
    '    <div class="nb-output-area">',
    `      <img class="nb-output-image" src="${placeholder}" alt="Preview of ${escapeHtml(
      title || "project"
    )}">`,
    "    </div>",
    "  </div>",
    "</div>",
  ].join("\n");
}

function buildProjectsNotebook(projects, title = "Projects") {
  if (!Array.isArray(projects) || projects.length === 0) {
    return [
      buildNotebookMarkdownCell(title),
      buildNotebookCodeCell("No projects found."),
    ].join("\n");
  }

  return projects
    .map((project) => {
      const title = project.title || "Untitled Project";
      const summary = project.summary || "";
      return [
        '<div class="notebook-project">',
        buildNotebookMarkdownCell(title),
        buildNotebookCodeCell(summary),
        buildNotebookOutputCell(title),
        "</div>",
      ].join("\n");
    })
    .join("\n");
}

function renderNotebook(notebookId, title, projects) {
  const notebookEl = document.getElementById(notebookId);
  if (!notebookEl) return;

  notebookEl.innerHTML = buildProjectsNotebook(projects, title);
}

async function renderProjects() {
  const notebookEl = document.getElementById("projectsNotebook");
  if (!notebookEl) return;

  try {
    const res = await fetch("projects.json");
    const projects = await res.json();
    notebookEl.innerHTML = buildProjectsNotebook(projects, "Projects");
  } catch (error) {
    console.error("Failed to load projects.json", error);
    notebookEl.innerHTML = [
      buildNotebookMarkdownCell("Projects"),
      buildNotebookCodeCell("Failed to load projects.json."),
    ].join("\n");
  }
}

function renderStaticNotebooks() {
  renderNotebook("createLabNotebook", "Create Lab", CREATE_LAB_PROJECTS);
  renderNotebook("curoResearchNotebook", "Curo Research", CURO_RESEARCH_PROJECTS);
  renderNotebook("personalNotebook", "Personal Project", PERSONAL_PROJECTS);
}

document.addEventListener("DOMContentLoaded", () => {
  const explorerToggle = document.getElementById("activityExplorer");
  const sidebar = document.querySelector(".sidebar");
  const appRoot = document.querySelector(".app");

  if (explorerToggle && sidebar && appRoot) {
    explorerToggle.addEventListener("click", () => {
      const isHidden = sidebar.classList.toggle("is-hidden");
      appRoot.classList.toggle("sidebar-collapsed", isHidden);
      explorerToggle.classList.toggle("is-active", !isHidden);
    });
  }

  bindSidebarSectionToggles();
  bindSectionSwitchers();
  bindTabClosers();

  const initial =
    document.querySelector(".tab.is-active")?.dataset.section || SECTION_IDS[0];
  setActiveSection(initial);
  renderProjects();
  renderStaticNotebooks();
});
