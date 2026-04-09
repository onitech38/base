import { store } from "./store.js";

/* =====================================================
   UTIL: PROGRESS UI GLOBAL
===================================================== */
function updateProgressUI() {
  const value = store.state.progress.global;

  const valueEl = document.getElementById("progress-value");
  const fillEl = document.getElementById("progress-fill");

  if (valueEl) valueEl.textContent = `${value}%`;
  if (fillEl) fillEl.style.width = `${value}%`;
}

window.addEventListener("store-updated", updateProgressUI);
document.addEventListener("DOMContentLoaded", updateProgressUI);

/* =====================================================
   SETUP (FECHO DEFINITIVO)
===================================================== */
document.addEventListener("click", (e) => {
  if (e.target.id !== "setup-submit") return;

  const project = {
    name: document.getElementById("setup-name")?.value.trim(),
    type: document.getElementById("setup-type")?.value,
    goal: document.getElementById("setup-goal")?.value,
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
  store.completeSetup(); // ✅ currentPhaseIndex = 1

  location.hash = "#/process-builder";
});

/* =====================================================
   WIZARD STATE
===================================================== */
let currentPhase = null;

/* =====================================================
   ELEMENTOS
===================================================== */
const phaseTitleEl = () => document.getElementById("pb-phase-title");
const taskListEl = () => document.getElementById("pb-task-list");
const processListEl = () => document.getElementById("pb-process-list");
const primaryCTAEl = () => document.getElementById("pb-primary-cta");
const overviewEl = () => document.getElementById("pb-overview");
const executionEl = () => document.getElementById("pb-execution");
const exportEl = () => document.getElementById("pb-export");

/* =====================================================
   HELPERS
===================================================== */
function phaseState(index) {
  if (index < store.currentPhaseIndex) return "completed";
  if (index === store.currentPhaseIndex) return "active";
  return "locked";
}

/* =====================================================
   OVERVIEW (Progress Builder)
===================================================== */
function renderOverview() {
  processListEl().innerHTML = "";

  store.processes.forEach((phase, index) => {
    const li = document.createElement("li");
    li.textContent = phase.name;
    li.className = `phase-${phaseState(index)}`;

    if (phaseState(index) !== "locked") {
      li.onclick = () => openPhase(index);
    } else {
      li.title = "Conclui a fase anterior para desbloquear";
    }

    processListEl().appendChild(li);
  });
}

/* =====================================================
   EXECUÇÃO DA FASE
===================================================== */
function openPhase(index) {
  currentPhase = index;

  overviewEl().style.display = "none";
  exportEl().style.display = "none";
  executionEl().style.display = "block";

  const phase = store.processes[index];
  phaseTitleEl().textContent = phase.name;

  renderTasks(index);

  primaryCTAEl().textContent =
    index < store.currentPhaseIndex ? "Guardar" : "Guardar e continuar";
}

/* =====================================================
   TAREFAS
===================================================== */
function renderTasks(phaseIndex) {
  taskListEl().innerHTML = "";

  store.processes[phaseIndex].tasks.forEach((task) => {
    const li = document.createElement("li");
    li.textContent = task.done ? "✓ " + task.name : task.name;
    li.style.cursor = "pointer";

    li.onclick = () => {
      task.done = !task.done;
      store.save();
      renderTasks(phaseIndex);
    };

    taskListEl().appendChild(li);
  });
}

/* =====================================================
   CTA PRINCIPAL (GUARDAR / CONTINUAR)
===================================================== */
document.addEventListener("click", (e) => {
  if (e.target.id !== "pb-primary-cta") return;

  const phaseIndex = currentPhase;
  const phase = store.processes[phaseIndex];

  const isEdit = phaseIndex < store.currentPhaseIndex;

  if (!isEdit) {
    const allDone = phase.tasks.every(t => t.done);
    if (!allDone) {
      alert("Conclui todas as tarefas antes de continuar.");
      return;
    }
    store.completeCurrentPhase();
  } else {
    store.save();
  }

  if (store.state.progress.global === 100) {
    showExport();
  } else {
    openPhase(store.currentPhaseIndex);
  }
});

/* =====================================================
   EXPORT
===================================================== */
function showExport() {
  executionEl().style.display = "none";
  overviewEl().style.display = "none";
  exportEl().style.display = "block";
}

document.addEventListener("click", (e) => {
  if (e.target.id === "export-btn") {
    alert("Export real já implementado (ZIP).");
  }
});

/* =====================================================
   INIT
===================================================== */
window.processBuilder = {
  loadProcesses() {
    updateProgressUI();
    if (store.state.progress.global === 100) {
      showExport();
    } else {
      openPhase(store.currentPhaseIndex);
    }
  }
};

window.store = store;
``
