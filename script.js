const SECTION_IDS = [
  "about",
  "resume",
  "projects",
  "create-lab",
  "curo-research",
  "course-projects",
  "personal",
  "contact",
];
const INDENT = "    ";
const CREATE_LAB_FALLBACK_PROJECTS = [
  {
    title: "Create Lab",
    summary: "Add your Create Lab projects here.",
  },
];
const CURO_RESEARCH_FALLBACK_PROJECTS = [
  {
    title: "Curo Research",
    summary: "Add your Curo Research projects here.",
  },
];
const PERSONAL_FALLBACK_PROJECTS = [
  {
    title: "Personal Project",
    summary: "Add your personal projects here.",
  },
];
const COURSE_PROJECTS_FALLBACK_PROJECTS = [
  {
    title: "Course Projects",
    summary: "Course project details coming soon.",
  },
];
const COURSE_PROJECT_IDS = new Set([
  "electronic-test-bench",
  "sensor-integrated-gimbal-headlight-tracker",
]);
let projectsDataPromise;

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
  const language = document.getElementById("statusLanguage");
  if (language) language.textContent = sectionId === "contact" ? "Python" : sectionId === "about" ? "Markdown" : sectionId === "resume" ? "PDF" : "Jupyter";
  const indent = document.getElementById("statusIndent");
  if (indent) indent.textContent = sectionId === "contact" ? "Spaces: 4" : "Spaces: 2";
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
      ? '<a class="breadcrumb-download" href="Resume.pdf?v=968fac69a270" download aria-label="Download Resume.pdf" title="Download Resume.pdf"><span class="codicon codicon-download" aria-hidden="true"></span></a>'
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
  document.querySelectorAll(".sidebar-file, .readme-projects-button").forEach((button) =>
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
    '<div class="nb-cell nb-markdown">',
    '  <div class="nb-cell-gutter"><span class="nb-prompt" aria-hidden="true"></span></div>',
    '  <div class="nb-cell-body">',
    '    <div class="nb-markdown-content">',
    `      <h3>${escapeHtml(title || "Untitled Project")}</h3>`,
    "    </div>",
    "  </div>",
    "</div>",
  ].join("\n");
}

function buildNotebookPythonSource(name, value) {
  const text = String(value);
  const assignment = `${t.variable(name)} ${t.operator("=")}`;
  const string = `<span class="tok-string">${escapeHtml(JSON.stringify(text))}</span>`;
  if (text.length <= 72) return line(`${assignment} ${string}`);
  return [
    line(`${assignment} <span class="tok-bracket">(</span>`),
    `<span class="line has-indent nb-string-line">${INDENT}${string}</span>`,
    line('<span class="tok-bracket">)</span>'),
  ].join("\n");
}

function buildNotebookCodeCell(projectOrSummary, showPrompt = true) {
  const codeAssignments = [];
  const isProjectObject =
    projectOrSummary && typeof projectOrSummary === "object";

  if (isProjectObject) {
    const overview = projectOrSummary.projectOverview || projectOrSummary.summary;
    const contribution = projectOrSummary.specificContribution;
    const technicalDetails = projectOrSummary.technicalDetails;

    if (overview) {
      codeAssignments.push(["project_overview", overview]);
    }
    if (contribution) {
      codeAssignments.push(["specific_contribution", contribution]);
    }
    if (technicalDetails) {
      codeAssignments.push(["technical_details", technicalDetails]);
    }
  }

  if (codeAssignments.length === 0) {
    codeAssignments.push(["description", String(projectOrSummary || "")]);
  }

  const source = codeAssignments
    .map(([name, value]) => buildNotebookPythonSource(name, value))
    .join(`\n${line("")}\n`);
  return [
    '<div class="nb-cell nb-code-cell">',
    `  <div class="nb-cell-gutter">${showPrompt ? '<span class="codicon codicon-ellipsis" aria-label="Output"></span>' : ""}</div>`,
    '  <div class="nb-cell-body">',
    `    <pre class="code-block python-source nb-code" tabindex="0" aria-label="Python project details"><code>${source}</code></pre>`,
    "  </div>",
    "</div>",
  ].join("\n");
}

function buildNotebookOutputCell(project, outputId) {
  const title = project?.title || "project";
  const number = Number.isInteger(project?.projectNumber) ? project.projectNumber : " ";
  const gutter = [
    '  <div class="nb-cell-gutter nb-input-gutter">',
    `    <button class="nb-cell-run" type="button" aria-label="Show details for ${escapeHtml(title)}" title="Show project details" aria-expanded="false" aria-controls="${escapeHtml(outputId || "")}"><span class="codicon codicon-play" aria-hidden="true"></span></button>`,
    `    <span class="nb-prompt nb-execution-count" aria-label="Project ${number}">[${number}]</span>`,
    '  </div>',
  ].join("\n");
  const images = Array.isArray(project?.images)
    ? project.images.filter((path) => typeof path === "string" && path.trim())
    : [];
  const fallbackImage = buildPlaceholderImage(title);
  const outputImage = images[0] || fallbackImage;

  if (images.length <= 1) {
    return [
      '<div class="nb-output">',
      gutter,
      '  <div class="nb-cell-body">',
      '    <div class="nb-output-area">',
      `      <img class="nb-output-image" src="${escapeHtml(
        outputImage
      )}" alt="Preview of ${escapeHtml(title)}" loading="lazy" role="button" tabindex="0" aria-controls="${escapeHtml(outputId || "")}" aria-expanded="false" aria-label="Preview of ${escapeHtml(title)}. Show project details" title="Show project details">`,
      "    </div>",
      "  </div>",
      "</div>",
    ].join("\n");
  }

  const slidesMarkup = images
    .map((imagePath, index) => {
      return `          <img class="nb-output-image nb-slider-slide" src="${escapeHtml(
        imagePath
      )}" alt="Preview ${index + 1} of ${escapeHtml(
        title
      )}" loading="lazy" role="button" tabindex="${index === 0 ? 0 : -1}" aria-hidden="${index !== 0}" aria-controls="${escapeHtml(outputId || "")}" aria-expanded="false" aria-label="Preview ${index + 1} of ${escapeHtml(title)}. Show project details" title="Show project details">`;
    })
    .join("\n");

  const dotsMarkup = images
    .map(
      (_, index) =>
        `          <button class="nb-slider-dot${
          index === 0 ? " is-active" : ""
        }" type="button" data-slide-to="${index}" aria-label="Show image ${
          index + 1
        }"></button>`
    )
    .join("\n");

  return [
    '<div class="nb-output">',
    gutter,
    '  <div class="nb-cell-body">',
    '    <div class="nb-output-area">',
    '      <div class="nb-slider" data-slide-index="0">',
    '        <div class="nb-slider-track">',
    slidesMarkup,
    "        </div>",
    '        <button class="nb-slider-button nb-slider-prev" type="button" aria-label="Previous image">&#10094;</button>',
    '        <button class="nb-slider-button nb-slider-next" type="button" aria-label="Next image">&#10095;</button>',
    '        <div class="nb-slider-dots">',
    dotsMarkup,
    "        </div>",
    "      </div>",
    "    </div>",
    "  </div>",
    "</div>",
  ].join("\n");
}

function buildCollapsibleProjectOutput(project, outputId) {
  return [
    `<details class="nb-project-output" id="${escapeHtml(outputId)}">`,
    `  <summary class="nb-output-toggle" aria-label="Toggle project details for ${escapeHtml(project.title || "Untitled Project")}" title="Show or hide project details">`,
    '    <span class="nb-cell-gutter nb-output-menu"><span class="codicon codicon-ellipsis" aria-hidden="true"></span></span>',
    '  </summary>',
    buildNotebookCodeCell(project, false),
    '</details>',
  ].join("\n");
}

function buildProjectsNotebook(projects, title = "Projects") {
  if (!Array.isArray(projects) || projects.length === 0) {
    return [
      buildNotebookMarkdownCell(title),
      buildNotebookCodeCell("No projects found."),
    ].join("\n");
  }

  const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return projects
    .map((project, index) => {
      const title = project.title || "Untitled Project";
      const outputId = `nb-details-${titleSlug}-${index}`;
      return [
        `<div class="notebook-project" role="listitem" tabindex="0" aria-label="${escapeHtml(title)}">`,
        buildNotebookMarkdownCell(title),
        buildNotebookOutputCell(project, outputId),
        buildCollapsibleProjectOutput(project, outputId),
        "</div>",
      ].join("\n");
    })
    .join("\n");
}

function updateSliderHeight(slider) {
  const track = slider.querySelector(".nb-slider-track");
  const slides = track?.querySelectorAll(".nb-slider-slide");
  const image = slides?.[Number(slider.dataset.slideIndex || 0)];
  if (!image?.naturalWidth || !image.naturalHeight || !track.clientWidth) return;
  track.style.height = `${track.clientWidth * image.naturalHeight / image.naturalWidth}px`;
}

function setSliderIndex(slider, nextIndex) {
  const track = slider.querySelector(".nb-slider-track");
  if (!track) return;

  const slides = Array.from(track.querySelectorAll(".nb-slider-slide"));
  if (slides.length === 0) return;

  const boundedIndex = ((nextIndex % slides.length) + slides.length) % slides.length;
  slider.dataset.slideIndex = String(boundedIndex);
  track.style.transform = `translateX(-${boundedIndex * 100}%)`;
  slides.forEach((slide, index) => {
    slide.tabIndex = index === boundedIndex ? 0 : -1;
    slide.setAttribute("aria-hidden", String(index !== boundedIndex));
  });
  updateSliderHeight(slider);

  const dots = slider.querySelectorAll(".nb-slider-dot");
  dots.forEach((dot, idx) => {
    dot.classList.toggle("is-active", idx === boundedIndex);
    dot.setAttribute("aria-current", idx === boundedIndex ? "true" : "false");
  });
}

function initNotebookSliders(scope = document) {
  scope.querySelectorAll(".nb-slider").forEach((slider) => {
    const track = slider.querySelector(".nb-slider-track");
    if (!track) return;

    const slides = track.querySelectorAll(".nb-slider-slide");
    if (slides.length <= 1) return;

    slides.forEach((image) => {
      image.addEventListener("load", () => updateSliderHeight(slider));
    });
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateSliderHeight(slider));
      observer.observe(slider);
    } else {
      window.addEventListener("resize", () => updateSliderHeight(slider));
    }

    setSliderIndex(slider, Number(slider.dataset.slideIndex || 0));

    const prevButton = slider.querySelector(".nb-slider-prev");
    const nextButton = slider.querySelector(".nb-slider-next");
    const dots = slider.querySelectorAll(".nb-slider-dot");

    prevButton?.addEventListener("click", () => {
      setSliderIndex(slider, Number(slider.dataset.slideIndex || 0) - 1);
    });

    nextButton?.addEventListener("click", () => {
      setSliderIndex(slider, Number(slider.dataset.slideIndex || 0) + 1);
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const targetIndex = Number(dot.dataset.slideTo || 0);
        setSliderIndex(slider, targetIndex);
      });
    });
  });
}

function initNotebookSelection(notebook) {
  const select = (project) => {
    if (!project || !notebook.contains(project)) return;
    notebook.querySelectorAll(".notebook-project").forEach((cell) => {
      cell.classList.toggle("is-selected", cell === project);
    });
  };
  select(notebook.querySelector(".notebook-project"));
  if (notebook.dataset.selectionBound) return;
  notebook.dataset.selectionBound = "true";
  const syncOutput = (output) => {
    const project = output.closest(".notebook-project");
    const play = project?.querySelector(".nb-cell-run");
    if (!play) return;
    play.setAttribute("aria-expanded", String(output.open));
    const title = project.getAttribute("aria-label");
    play.setAttribute("aria-label", `${output.open ? "Hide" : "Show"} details for ${title}`);
    play.title = output.open ? "Hide project details" : "Show project details";
    project.querySelectorAll(".nb-output-image").forEach((image) => {
      image.setAttribute("aria-expanded", String(output.open));
      image.title = play.title;
      image.setAttribute("aria-label", `${image.alt}. ${play.title}`);
    });
  };
  const toggleOutput = (target) => {
    const output = target.closest(".notebook-project")?.querySelector(".nb-project-output");
    if (!output) return;
    output.open = !output.open;
    syncOutput(output);
  };
  const selectFromEvent = (event) => select(event.target.closest(".notebook-project"));
  notebook.addEventListener("click", (event) => {
    selectFromEvent(event);
    const trigger = event.target.closest(".nb-cell-run, .nb-output-image");
    if (trigger) toggleOutput(trigger);
  });
  notebook.addEventListener("keydown", (event) => {
    if (!event.target.matches(".nb-output-image") || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    toggleOutput(event.target);
  });
  notebook.addEventListener("focusin", selectFromEvent);
  notebook.addEventListener("toggle", (event) => {
    if (event.target.matches(".nb-project-output")) syncOutput(event.target);
  }, true);
}

function renderNotebook(notebookId, title, projects) {
  const notebookEl = document.getElementById(notebookId);
  if (!notebookEl) return;

  notebookEl.innerHTML = buildProjectsNotebook(projects, title);
  initNotebookSelection(notebookEl);
  initNotebookSliders(notebookEl);
}

async function loadProjectsData() {
  if (!projectsDataPromise) {
    projectsDataPromise = fetch("projects.json", { cache: "no-cache" }).then(async (res) => {
      if (!res.ok) {
        throw new Error(`Failed to load projects.json (${res.status})`);
      }
      const projects = await res.json();
      return projects.map((project, index) => ({ ...project, projectNumber: index + 1 }));
    });
  }
  return projectsDataPromise;
}

async function renderProjects() {
  const notebookEl = document.getElementById("projectsNotebook");
  if (!notebookEl) return;

  try {
    const projects = await loadProjectsData();
    notebookEl.innerHTML = buildProjectsNotebook(projects, "Projects");
    initNotebookSelection(notebookEl);
    initNotebookSliders(notebookEl);
  } catch (error) {
    console.error("Failed to load projects.json", error);
    notebookEl.innerHTML = [
      buildNotebookMarkdownCell("Projects"),
      buildNotebookCodeCell("Failed to load projects.json."),
    ].join("\n");
    initNotebookSliders(notebookEl);
  }
}

async function renderStaticNotebooks() {
  try {
    const projects = await loadProjectsData();
    const allProjects = Array.isArray(projects) ? projects : [];
    const curoResearchProjects = allProjects.slice(0, 1);
    const createLabProjects = allProjects.slice(1, 3);
    const courseProjects = allProjects.filter((project) => COURSE_PROJECT_IDS.has(project.id));
    const personalProjects = allProjects.slice(3).filter((project) => !COURSE_PROJECT_IDS.has(project.id));

    renderNotebook("curoResearchNotebook", "Curo Research", curoResearchProjects);
    renderNotebook("createLabNotebook", "Create Lab", createLabProjects);
    renderNotebook("courseProjectsNotebook", "Course Projects", courseProjects);
    renderNotebook("personalNotebook", "Personal Projects", personalProjects);
  } catch (error) {
    console.error("Failed to load projects.json for notebook sections", error);
    renderNotebook("curoResearchNotebook", "Curo Research", CURO_RESEARCH_FALLBACK_PROJECTS);
    renderNotebook("createLabNotebook", "Create Lab", CREATE_LAB_FALLBACK_PROJECTS);
    renderNotebook("courseProjectsNotebook", "Course Projects", COURSE_PROJECTS_FALLBACK_PROJECTS);
    renderNotebook("personalNotebook", "Personal Projects", PERSONAL_FALLBACK_PROJECTS);
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
      explorerToggle.setAttribute("aria-expanded", String(!isHidden));
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
