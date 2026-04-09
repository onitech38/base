import store from "./store.js";

/* =====================
   PROGRESS HEADER
===================== */
function updateProgressUI() {
  const value = store.state.progress.global;
  const valueEl = document.getElementById("progress-value");
  const fillEl = document.getElementById("progress-fill");
  if (valueEl) valueEl.textContent = `${value}%`;
  if (fillEl) fillEl.style.width = `${value}%`;
}
window.addEventListener("store-updated", updateProgressUI);

/* =====================
   SETUP
===================== */
document.addEventListener("click", e => {
  if (e.target.id !== "setup-submit") return;

  const project = {
    name: document.getElementById("setup-name").value.trim(),
    type: document.getElementById("setup-type").value,
    goal: document.getElementById("setup-goal").value,
  };

  store.setProjectConfig(project);

  if (!store.isSetupComplete()) {
    alert("Preenche nome, tipo e objetivo.");
    return;
  }

  store.generateProcessesFromProject();
  store.completeSetup();
  location.hash = "#/process-builder";
});

/* =====================
   BRANDING
===================== */
document.addEventListener("click", e => {
  if (e.target.id !== "save-branding") return;

  store.state.project.branding = {
    neutralLight: document.getElementById("color-neutral-light").value,
    neutralDark: document.getElementById("color-neutral-dark").value,
    primaryColor: document.getElementById("color-primary").value,
    secondaryColor: document.getElementById("color-secondary").value,
    fontPrimary:
      document.getElementById("font-primary").value ||
      "system-ui, Arial, sans-serif",
    fontSecondary:
      document.getElementById("font-secondary").value || null,
    darkMode: document.getElementById("toggle-dark-mode").checked,
  };

  store.save();
  alert("Branding guardado com sucesso.");
});

/* =====================
   HOME DASHBOARD
===================== */
function renderHomeDashboard() {
  const container = document.getElementById("home-dashboard");
  if (!container) return;

  container.innerHTML = "";

  store.processes.forEach((phase, index) => {
    const div = document.createElement("div");
    div.className = "home-phase";

    const h3 = document.createElement("h3");
    h3.textContent = phase.name;
    div.appendChild(h3);

    const ul = document.createElement("ul");
    phase.tasks.forEach(task => {
      const li = document.createElement("li");
      li.textContent = task.done ? `✅ ${task.name}` : `⬜ ${task.name}`;
      ul.appendChild(li);
    });

    div.appendChild(ul);
    container.appendChild(div);
  });

  if (store.state.progress.global === 100) {
    const btn = document.createElement("button");
    btn.textContent = "Pré-visualizar & Exportar";
    btn.onclick = openPreview;
    btn.style.marginTop = "2rem";
    container.appendChild(btn);
  }
}
window.renderHomeDashboard = renderHomeDashboard;

/* =====================
   EXPORT + PREVIEW
===================== */
function openPreview() {
  const frame = document.getElementById("preview-frame");
  const modal = document.getElementById("export-preview");

  const project = store.state.project;
  const branding = project.branding || {};

  const primary = branding.primaryColor || "#4c6ef5";
  const font = branding.fontPrimary || "system-ui, Arial, sans-serif";

  frame.srcdoc = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family:${font}; padding:2rem; }
h1 { color:${primary}; }
</style>
</head>
<body>
<h1>${project.name}</h1>
<p>${project.goal}</p>
</body>
</html>`;

  modal.style.display = "block";
}

function closePreview() {
  document.getElementById("export-preview").style.display = "none";
}

function exportProject() {
  const zip = new JSZip();
  const project = store.state.project;
  const branding = project.branding || {};

  const css = `
:root {
  --primary:${branding.primaryColor || "#4c6ef5"};
  --secondary:${branding.secondaryColor || "#15aabf"};
  --font:${branding.fontPrimary || "system-ui, Arial"};
}
body {
  font-family:var(--font);
}
`;

  zip.file("index.html", `<h1>${project.name}</h1>`);
  zip.file("assets/css/style.css", css);
  zip.file("assets/js/main.js", `console.log("Projeto ${project.name}");`);
  zip.file("README.md", `# ${project.name}\n\n${project.goal}`);

  zip.generateAsync({ type: "blob" }).then(blob => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
}

window.exportProject = exportProject;
window.openPreview = openPreview;
window.closePreview = closePreview;
``
