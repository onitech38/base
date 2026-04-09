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
   EXPORT
========================= */
document.addEventListener("click", (e) => {
  if (e.target.id !== "export-btn") return;
  alert("Projeto exportado com sucesso!");
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
``
