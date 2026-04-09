import { store } from "./store.js";

/* =========================
   SETUP
========================= */
document.addEventListener("click", (e) => {
  if (e.target.id !== "setup-submit") return;

  const project = {
    name: document.getElementById("setup-name")?.value.trim() || "",
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
    alert("Preenche nome, tipo e objetivo do projeto.");
    return;
  }

  store.generateProcessesFromProject();
  store.completeSetup();

  location.hash = "#/process-builder";
});

/* =========================
   HELPERS
========================= */
function getPhaseState(index) {
  if (index < store.currentPhaseIndex) return "completed";
  if (index === store.currentPhaseIndex) return "active";
  return "locked";
}

/* =========================
   PLAN VIEW
========================= */
const processListEl = () => document.getElementById("pb-process-list");
const planViewEl = () => document.getElementById("pb-plan-view");
const taskViewEl = () => document.getElementById("pb-task-view");
const taskTitleEl = () => document.getElementById("pb-task-title");
const taskDescEl = () => document.getElementById("pb-task-description");

let activeProcessIndex = null;
let activeTaskIndex = null;

function renderPlan() {
  processListEl().innerHTML = "";

  store.processes.forEach((process, pIndex) => {
    const state = getPhaseState(pIndex);
    const li = document.createElement("li");
    li.textContent = process.name;

    if (state === "completed") {
      li.style.opacity = "0.5";
      li.onclick = () => openPhase(pIndex);
    }

    if (state === "active") {
      li.style.fontWeight = "bold";
      li.onclick = () => openPhase(pIndex);
    }

    if (state === "locked") {
      li.style.opacity = "0.3";
      li.title = "Conclui a fase anterior para desbloquear";
    }

    processListEl().appendChild(li);
  });
}

/* =========================
   PHASE / TASK VIEW
========================= */
function openPhase(pIndex) {
  activeProcessIndex = pIndex;
  activeTaskIndex = null;

  planViewEl().style.display = "none";
  taskViewEl().style.display = "block";

  const process = store.processes[pIndex];
  taskTitleEl().textContent = process.name;
  taskDescEl().innerHTML = "";

  process.tasks.forEach((task, tIndex) => {
    const btn = document.createElement("button");
    btn.textContent = task.done ? "✓ " + task.name : task.name;
    btn.disabled = task.done;
    btn.onclick = () => openTask(pIndex, tIndex);
    taskDescEl().appendChild(btn);
  });
}

function openTask(pIndex, tIndex) {
  activeTaskIndex = tIndex;
}

/* =========================
   TASK ACTIONS
========================= */
document.addEventListener("click", (e) => {
  if (e.target.id === "pb-task-done") {
    const task =
      store.processes[activeProcessIndex].tasks[activeTaskIndex];

    task.done = true;

    const allDone = store.processes[activeProcessIndex].tasks
      .every(t => t.done);

    if (allDone) {
      store.completeCurrentPhase();
    }

    store.save();
    backToPlan();
  }

  if (e.target.id === "pb-back-to-process") {
    backToPlan();
  }
});

function backToPlan() {
  taskViewEl().style.display = "none";
  planViewEl().style.display = "block";
  renderPlan();
}

/* =========================
   ENTRY POINT
========================= */
window.processBuilder = {
  loadProcesses() {
    renderPlan();
  },
};

/* =========================
   EXPORT
========================= */
document.addEventListener("click", (e) => {
  if (e.target.id !== "export-btn") return;

  if (store.state.progress.global < 100) {
    alert("Conclui todas as fases antes de exportar.");
    return;
  }

  alert("Projeto exportado com sucesso.");
});

window.store = store;

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

window.addEventListener("store-updated", () => {
  updateProgressUI();
});

document.addEventListener("DOMContentLoaded", () => {
  updateProgressUI();
});


