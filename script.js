// Theme toggle and project rendering
(function() {
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved) root.setAttribute("data-theme", saved);
  document.getElementById("themeToggle").addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
})();

async function loadProjects() {
  try {
    const res = await fetch("projects.json");
    const projects = await res.json();
    const grid = document.getElementById("projectsGrid");
    grid.innerHTML = projects.map(p => `
      <article class="card">
        <h3>${p.title}</h3>
        <p>${p.summary}</p>
        <div class="badges">${p.tags.map(t => `<span class="badge">${t}</span>`).join("")}</div>
        ${p.link ? `<p><a href="${p.link}" target="_blank" rel="noopener">View project</a></p>` : ""}
      </article>
    `).join("");
  } catch (e) {
    console.error("Failed to load projects", e);
  }
}
loadProjects();
