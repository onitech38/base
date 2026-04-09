import { store } from "./store.js";

/* =========================
   SETUP
========================= */
document.addEventListener("click", (e) => {
  if (e.target.id !== "setup-submit") return;

  const project = {
    name: document.getElementById("setup-name")?.value || "",
    type: document.getElementById("setup-type")?.value || "",
    goal: document.getElementById("setup-goal")?.value || "",
    features: {
      login: document.getElementById("feature-login")?.checked || false,
      backend: document.getElementById("feature-backend")?.checked || false,
      pwa: document.getElementById("feature-pwa")?.checked || false,
    },
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

/* =========================
   PROCESS BUILDER
========================= */
const processListEl = () => document.getElementById("pb-process-list");
const taskListEl = () => document.getElementById("pb-task-list");
const phaseTitleEl = () => document.getElementById("pb-phase-title");
const exportBtn = () => document.getElementById("export-btn");

function getPhaseState(index) {
  if (index < store.currentPhaseIndex) return "completed";
  if (index === store.currentPhaseIndex) return "active";
  return "locked";
}

function renderBuilder() {
  processListEl().innerHTML = "";
  taskListEl().innerHTML = "";

  store.processes.forEach((phase, i) => {
    const li = document.createElement("li");
    li.textContent = phase.name;

    const state = getPhaseState(i);

    if (state === "completed") li.style.opacity = "0.5";
    if (state === "locked") li.style.opacity = "0.25";

    processListEl().appendChild(li);
  });

  const active = store.processes[store.currentPhaseIndex];
  phaseTitleEl().textContent = active.name;

  active.tasks.forEach((task, i) => {
    const li = document.createElement("li");
    li.textContent = task.done ? "✓ " + task.name : task.name;
    li.style.textDecoration = task.done ? "line-through" : "none";
    li.onclick = () => {
      task.done = !task.done;
      store.save();
      renderBuilder();
    };
    taskListEl().appendChild(li);
  });

  if (store.state.progress.global === 100) {
    exportBtn().style.display = "block";
  } else {
    exportBtn().style.display = "none";
  }
}

/* =========================
   CONCLUIR FASE
========================= */
document.addEventListener("click", (e) => {
  if (e.target.id !== "pb-complete-phase") return;

  const active = store.processes[store.currentPhaseIndex];
  const allDone = active.tasks.every(t => t.done);

  if (!allDone) {
    alert("Conclui todas as tarefas antes de continuar.");
    return;
  }

  store.completeCurrentPhase();
  renderBuilder();
});

/* =========================
   EXPORT REAL (ZIP)
========================= */
document.addEventListener("click", async (e) => {
  if (e.target.id !== "export-btn") return;

  if (store.state.progress.global < 100) {
    alert("Conclui todas as fases antes de exportar.");
    return;
  }

  const zip = new JSZip();

  // root folder
  const root = zip.folder("project");

  /* ------------ index.html ------------ */
  root.file(
    "index.html",
    `<!doctype html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${store.state.project.name}</title>
  <link rel="stylesheet" href="assets/css/style.css" />
</head>
<body>
  <h1>${store.state.project.name}</h1>
  <p>${store.state.project.goal}</p>
</body>
</html>`
  );

  /* ------------ pages ------------ */
  const pages = root.folder("pages");

  [
    "home",
    "setup",
    "branding",
    "process-builder",
    "a11y",
    "seo",
  ].forEach((page) => {
    pages.file(
      `${page}.html`,
      `<!-- ${page}.html -->
<section>
  <h1>${page}</h1>
</section>`
    );
  });

  /* ------------ assets ------------ */
  const assets = root.folder("assets");
  assets.folder("css").file(
    "style.css",
    `/* Base styles */
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 2rem;
}`
  );

  assets.folder("js").file(
    "app.js",
    `// JS base do projeto exportado`
  );

  /* ------------ manifest ------------ */
  root.file(
    "manifest.json",
    JSON.stringify(
      {
        name: store.state.project.name,
        short_name: store.state.project.name,
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
      },
      null,
      2
    )
  );

  /* ------------ README ------------ */
  root.file(
    "README.md",
    `# ${store.state.project.name}

Projeto gerado com o Progress Builder.

## Objetivo
${store.state.project.goal}

## Estrutura
Projeto base pronto para desenvolvimento.
`
  );

  /* ------------ gerar ZIP ------------ */
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${store.state.project.name || "project"}.zip`;
  link.click();

  URL.revokeObjectURL(url);
});

/* =========================
   INIT
========================= */
window.processBuilder = {
  loadProcesses() {
    renderBuilder();
  },
};

window.addEventListener("store-updated", renderBuilder);
window.store = store;

/* =========================
   PROGRESS UI (GLOBAL)
========================= */
function updateProgressUI() {
  const value = store.state.progress.global;

  const valueEl = document.getElementById("progress-value");
  const fillEl = document.getElementById("progress-fill");

  if (valueEl) {
    valueEl.textContent = `${value}%`;
  }

  if (fillEl) {
    fillEl.style.width = `${value}%`;
  }
}

/* ouvir mudanças no store */
window.addEventListener("store-updated", () => {
  updateProgressUI();
});

/* atualizar ao carregar página */
document.addEventListener("DOMContentLoaded", () => {
  updateProgressUI();
});

