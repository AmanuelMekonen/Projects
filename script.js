// Theme toggle and project rendering for the portfolio

// Immediately invoked function that wires up the dark/light theme toggle
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

// Load project data from projects.json and render it into #projectsGrid
async function loadProjects() {
  try {
    const res = await fetch("projects.json");
    const projects = await res.json(); // array of project objects
    const grid = document.getElementById("projectsGrid");

    // Build markup for each project card using data from projects.json
    grid.innerHTML = projects.map(p => `
      <article class="card">
        <h3>${p.title}</h3>
        <p>${p.summary}</p>
        <div class="badges">${p.tags.map(t => `<span class="badge">${t}</span>`).join("")}</div>
        ${p.link ? `<p><a href="${p.link}" target="_blank" rel="noopener">View project</a></p>` : ""}
      </article>
    `).join("");
  } catch (e) {
    // If anything fails (e.g., file not found), log the error for debugging
    console.error("Failed to load projects", e);
  }
}

// Kick off project loading as soon as the script runs
loadProjects();
