import store from "./store.js";
const app = document.getElementById("app");

/* =====================
   SETUP
===================== */
document.addEventListener("click", (e) => {
  if (e.target.id !== "setup-submit") return;

  const data = {
    name: document.getElementById("setup-name").value.trim(),
    type: document.getElementById("setup-type").value,
    goal: document.getElementById("setup-goal").value,

    features: {
      login: document.getElementById("feature-login").checked,
      backend: document.getElementById("feature-backend").checked,
      pwa: document.getElementById("feature-pwa").checked,
    },
  };

  if (!data.name || !data.type || !data.goal) {
    alert("Preenche nome, tipo e objetivo.");
    return;
  }

  store.completeSetup(data);
  location.hash = "#/process-builder";
});

/* =====================
   BRANDING
===================== */
document.addEventListener("click", (e) => {
  if (e.target.id !== "save-branding") return;

  store.state.project.branding = {
    neutralLight: document.getElementById("color-neutral-light").value,
    neutralDark: document.getElementById("color-neutral-dark").value,
    primaryColor: document.getElementById("color-primary").value,
    secondaryColor: document.getElementById("color-secondary").value,
    fontPrimary:
      document.getElementById("font-primary").value ||
      "system-ui, Arial, sans-serif",
    fontSecondary: document.getElementById("font-secondary").value || null,
    darkMode: document.getElementById("toggle-dark-mode").checked,
  };

  store.save();
  alert("Branding guardado com sucesso.");
});

/* =====================
   HOME DASHBOARD
===================== */

function calculateProgress(phases) {
  // tenta calcular por tarefas (se existirem)
  const allTasks = phases.flatMap((phase) => phase.tasks || []);

  if (allTasks.length > 0) {
    const doneTasks = allTasks.filter((t) => t.done).length;
    return Math.round((doneTasks / allTasks.length) * 100);
  }

  // fallback: progresso por fases
  const completedPhases = phases.filter((p) => p.status === "completed").length;
  return Math.round((completedPhases / phases.length) * 100);
}

function renderHomeDashboard() {
  const container = document.getElementById("home-dashboard");
  if (!container) return;

  container.innerHTML = "";

  const phases = store.phases;
  const progress = calculateProgress(phases);

  // Header (progresso global)
  const progressEl = document.getElementById("progress-value");
  const fillEl = document.getElementById("progress-fill");

  if (progressEl) progressEl.textContent = `${progress}%`;
  if (fillEl) fillEl.style.width = `${progress}%`;

  // Fases
  phases.forEach((phase) => {
    const div = document.createElement("div");
    div.className = "home-phase";

    const title = document.createElement("h3");
    title.textContent = phase.title;

    if (phase.status === "completed") {
      title.innerHTML += " ✅";
    }

    div.appendChild(title);

    // tarefas (se existirem)
    if (phase.tasks && phase.tasks.length > 0) {
      const ul = document.createElement("ul");
      phase.tasks.forEach((task) => {
        const li = document.createElement("li");
        li.textContent = task.done ? `✅ ${task.label}` : `⬜ ${task.label}`;
        ul.appendChild(li);
      });
      div.appendChild(ul);
    }

    container.appendChild(div);
  });

  // Botões finais (só quando tudo completo)
  if (phases.every((p) => p.status === "completed")) {
    const actions = document.createElement("div");
    actions.style.marginTop = "2rem";

    const previewBtn = document.createElement("button");
    previewBtn.textContent = "Pré-visualizar";
    previewBtn.onclick = openPreview;

    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Exportar";
    exportBtn.style.marginLeft = "1rem";
    exportBtn.onclick = exportProject;

    actions.appendChild(previewBtn);
    actions.appendChild(exportBtn);

    container.appendChild(actions);
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
  const secondary = branding.secondaryColor || "#15aabf";
  const font = branding.fontPrimary || "system-ui, Arial, sans-serif";
  const darkMode = branding.darkMode === true;

  const bgMain = darkMode ? "#0f1115" : "#ffffff";
  const bgHeader = darkMode ? "#1a1d23" : "#f5f6f8";
  const textMain = darkMode ? "#f1f3f5" : "#1e1e1e";
  const textMuted = darkMode ? "#adb5bd" : "#6c757d";

  frame.srcdoc = `
<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${project.name}</title>

<style>
  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: ${font};
    background: ${bgMain};
    color: ${textMain};
  }

  header {
    background: ${bgHeader};
    padding: 1.5rem 2rem;
    border-bottom: 3px solid ${primary};
  }

  header h1 {
    margin: 0;
    color: ${primary};
    font-size: 1.5rem;
  }

  main {
    padding: 3rem 2rem;
    max-width: 800px;
    margin: 0 auto;
  }

  p {
    line-height: 1.6;
    color: ${textMuted};
  }

  .highlight {
    margin-top: 2rem;
    padding: 1.5rem;
    border-left: 4px solid ${secondary};
    background: ${darkMode ? "#1f232b" : "#f8f9fa"};
  }
</style>
</head>

<body>
<header>
  <h1>${project.name}</h1>
</header>

<main>
  <h2>Objetivo do projeto</h2>
  <p>${project.goal || "Objetivo não definido."}</p>

  <div class="highlight">
    <strong>Pré-visualização do projeto</strong>
    <p>
      Este é um exemplo de como o teu projeto poderá começar,
      com base no branding e estrutura definidos.
    </p>
  </div>
</main>
</body>
</html>
`;

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
  font-family: var(--font);
}
`;

  zip.file("index.html", `<h1>${project.name}</h1>`);
  zip.file("assets/css/style.css", css);
  zip.file("assets/js/main.js", `console.log("Projeto ${project.name}");`);
  zip.file("README.md", `# ${project.name}\n\n${project.goal}`);

  zip.generateAsync({ type: "blob" }).then((blob) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
}

window.openPreview = openPreview;
window.closePreview = closePreview;
window.exportProject = exportProject;

/* =====================
   NAV FLOW (FIGMA)
===================== */
function updateNav() {
  const project = store.currentProject;
  const userName = project ? project.name : null;
  const setupDone = project && project.setupCompleted;

  const navHome = document.getElementById("nav-home");
  const navProcess = document.getElementById("nav-process");
  const navLogout = document.getElementById("nav-logout");

  if (!navHome || !navProcess || !navLogout) return;

  navHome.style.display = "none";
  navProcess.style.display = "none";
  navLogout.style.display = "none";

  if (userName) {
    navHome.textContent = userName;
    navHome.style.display = "inline-block";
    navHome.onclick = () => (location.hash = "#/home");
    navLogout.style.display = "inline-block";
  }

  if (setupDone) {
    navProcess.style.display = "inline-block";
  }
}

window.addEventListener("store-updated", updateNav);
document.addEventListener("DOMContentLoaded", updateNav);

/* =====================
   PROCESS BUILDER
===================== */

function loadPhases() {
  const list = document.getElementById("pb-process-list");
  if (!list) return;

  list.innerHTML = "";

  store.phases.forEach((phase) => {
    const li = document.createElement("li");
    li.className = `pb-phase pb-phase-${phase.status}`;
    li.textContent = phase.title;

    if (phase.status !== "locked") {
      li.onclick = () => openPhase(phase);
    } else {
      li.title = "Conclui a fase anterior para desbloquear";
    }

    list.appendChild(li);
  });
}

function openPhase(phase) {
  const overview = document.getElementById("pb-overview");
  const execution = document.getElementById("pb-execution");
  const title = document.getElementById("pb-phase-title");
  const cta = document.getElementById("pb-primary-cta");

  if (!overview || !execution || !title || !cta) return;

  overview.style.display = "none";
  execution.style.display = "block";

  title.textContent = phase.title;

  // Fase ativa → primeira execução
  if (phase.status === "active") {
    cta.textContent = "Guardar e continuar";
    cta.onclick = () => {
      store.completePhase(phase.id);
      closePhase();
    };
  }

  // Fase concluída → revisão
  if (phase.status === "completed") {
    cta.textContent = "Guardar";
    cta.onclick = () => {
      closePhase();
    };
  }
}

function closePhase() {
  const overview = document.getElementById("pb-overview");
  const execution = document.getElementById("pb-execution");

  if (!overview || !execution) return;

  execution.style.display = "none";
  overview.style.display = "block";

  loadPhases();
}

/* expor para o router */
window.processBuilder = {
  loadPhases,
};

/* =====================
   WELCOME ACTIONS
===================== */
document.addEventListener("click", (e) => {
  if (e.target.id === "welcome-login") {
    location.hash = "#/login";
  }

  if (e.target.id === "welcome-signup") {
    location.hash = "#/signup";
  }
});

/* =====================
   PROJECT SELECT
===================== */
document.addEventListener("click", (e) => {
  if (e.target.id !== "create-project") return;

  store.createProject();
  location.hash = "#/setup";
});
