// Theme toggle and project rendering for the portfolio

// Immediately invoked function that wired up the dark/light theme toggle
// (disabled for now to keep a single neon-dark theme)
/*
(function() {
  const root = document.documentElement;
  const saved = localStorage.getItem("theme"); // read previously saved theme, if any

  // Apply saved theme on first load so there is no flash of the wrong theme
  if (saved) root.setAttribute("data-theme", saved);

  // When the Theme button is clicked, flip between dark and light
  document.getElementById("themeToggle").addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next); // remember choice for future visits
  });
})();
*/

// Load project data from projects.json and render panels into #projectsPanels
async function loadProjectsPanels() {
  const container = document.getElementById("projectsPanels");
  if (!container) return; // not on the index page

  try {
    const res = await fetch("projects.json");
    const projects = await res.json(); // array of project objects

    container.innerHTML = projects
      .map((p) => {
        const id = p.id || encodeURIComponent(p.title.toLowerCase().replace(/\s+/g, "-"));
        const tags = (p.tags || []).slice(0, 3).join(" · ");
        return `
        <a class="project-panel" href="project.html?id=${id}">
          <div class="project-panel-inner">
            <div class="project-panel-header">
              <span class="project-panel-label">Project</span>
              <span class="project-panel-tagline">${tags}</span>
            </div>
            <div class="project-panel-title-block">
              <h3 class="project-panel-title">${p.title}</h3>
              <p class="project-panel-summary">${p.summary}</p>
            </div>
            <div class="project-panel-footer">
              <span class="project-panel-arrow">View</span>
            </div>
          </div>
        </a>
      `;
      })
      .join("");
  } catch (e) {
    console.error("Failed to load projects panels", e);
  }
}

// Load a single project detail if we are on project.html
async function loadProjectDetail() {
  const detailRoot = document.getElementById("projectDetail");
  if (!detailRoot) return; // not on a detail page

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  try {
    const res = await fetch("projects.json");
    const projects = await res.json();
    const project = projects.find(
      (p) => (p.id || p.title.toLowerCase().replace(/\s+/g, "-")) === id
    );
    if (!project) {
      detailRoot.innerHTML = `<p>Project not found.</p>`;
      return;
    }

    const tags = (project.tags || []).join(" · ");

    detailRoot.innerHTML = `
      <div class="project-detail-shell">
        <aside class="project-detail-rail">
          <span class="project-detail-rail-label">Project</span>
          <span class="project-detail-rail-title">${project.title}</span>
        </aside>
        <section class="project-detail-main">
          <header class="project-detail-header">
            <p class="project-detail-kicker">Case Study</p>
            <h1 class="project-detail-title">${project.title}</h1>
            <p class="project-detail-summary">${project.summary}</p>
          </header>
          <div class="project-detail-body">
            <p>
              This is a focused view of the project. You can expand this text in
              <code>projects.json</code> with a richer description, challenges, and results.
            </p>
          </div>
        </section>
        <aside class="project-detail-meta">
          <div class="project-detail-meta-block">
            <h2>Stack</h2>
            <p>${tags}</p>
          </div>
          ${
            project.link && project.link !== "#"
              ? `
          <div class="project-detail-meta-block">
            <h2>Link</h2>
            <p><a href="${project.link}" target="_blank" rel="noopener">Open project ↗</a></p>
          </div>
          `
              : ""
          }
          <div class="project-detail-meta-block project-detail-meta-back">
            <a href="index.html">← Back to projects</a>
          </div>
        </aside>
      </div>
    `;
  } catch (e) {
    console.error("Failed to load project detail", e);
  }
}

// Initialise whichever view is present
document.addEventListener("DOMContentLoaded", () => {
  loadProjectsPanels();
  loadProjectDetail();
});
