const SECTION_IDS = ["about", "resume", "projects", "contact"];
const INDENT = "    ";

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

  const tab = document.querySelector(`.tab[data-section="${sectionId}"]`);
  const label = tab?.textContent?.trim() || `${sectionId}.py`;
  const download =
    sectionId === "resume"
      ? '<a class="breadcrumb-download" href="Resume.pdf" download aria-label="Download Resume.pdf" title="Download Resume.pdf"><span class="codicon codicon-download" aria-hidden="true"></span></a>'
      : "";

  breadcrumb.innerHTML = `<span class="breadcrumb-label">${escapeHtml(
    label
  )}</span>${download}`;
}

function bindSectionSwitchers() {
  document.querySelectorAll(".tab, .sidebar-file").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveSection(button.dataset.section);
    });
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

function buildProjectsNotebook(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return [
      buildNotebookMarkdownCell("Projects"),
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

async function renderProjects() {
  const notebookEl = document.getElementById("projectsNotebook");
  if (!notebookEl) return;

  try {
    const res = await fetch("projects.json");
    const projects = await res.json();
    notebookEl.innerHTML = buildProjectsNotebook(projects);
  } catch (error) {
    console.error("Failed to load projects.json", error);
    notebookEl.innerHTML = [
      buildNotebookMarkdownCell("Projects"),
      buildNotebookCodeCell("Failed to load projects.json."),
    ].join("\n");
  }
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

  const initial =
    document.querySelector(".tab.is-active")?.dataset.section || SECTION_IDS[0];
  setActiveSection(initial);
  renderProjects();
});
