import { store } from "./store.js";

/* =====================================================
   SETUP (FECHO CORRETO DO ONBOARDING)
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

  // ✅ FECHO DEFINITIVO DO SETUP
  store.generateProcessesFromProject();
  store.completeSetup();

  // ✅ ESTE REDIRECT É O QUE FALTAVA
  location.hash = "#/process-builder";
});

/* =====================================================
   ESTADO DO WIZARD
===================================================== */
let mode = "execution";
let editingPhaseIndex = null;

/* =====================================================
   ELEMENTOS
===================================================== */
const overviewEl = () => document.getElementById("pb-overview");
const executionEl = () => document.getElementById("pb-execution");
const exportEl = () => document.getElementById("pb-export");

const processListEl = () => document.getElementById("pb-process-list");
const phaseTitleEl = () => document.getElementById("pb-phase-title");
const phaseDescEl = () => document.getElementById("pb-phase-description");
const taskListEl = () => document.getElementById("pb-task-list");

const primaryCTAEl = () => document.getElementById("pb-primary-cta");
const backOverviewEl = () => document.getElementById("pb-back-overview");

/* =====================================================
   HELPERS
===================================================== */
function phaseState(index) {
  if (index < store.currentPhaseIndex) return "completed";
  if (index === store.currentPhaseIndex) return "active";
  return "locked";
}

/* =====================================================
   OVERVIEW
===================================================== */
function renderOverview() {
  processListEl().innerHTML = "";

  store.processes.forEach((phase, index) => {
    const li = document.createElement("li");
    li.textContent = phase.name;
    li.className = `phase-${phaseState(index)}`;

    if (phaseState(index) !== "locked") {
      li.onclick = () => openPhase(index, index < store.currentPhaseIndex);
    }

    processListEl().appendChild(li);
  });
}

/* =====================================================
   EXECUÇÃO DE FASE
===================================================== */
function openPhase(index, isEdit) {
  editingPhaseIndex = index;

  overviewEl().style.display = "none";
  exportEl().style.display = "none";
  executionEl().style.display = "block";

  const phase = store.processes[index];

  phaseTitleEl().textContent = phase.name;
  phaseDescEl().textContent = isEdit
    ? "Estás a editar uma fase já concluída."
    : "Conclui as tarefas para continuar.";

  renderTasks(index);

  primaryCTAEl().textContent = isEdit ? "Guardar" : "Guardar e continuar";
}

/* =====================================================
   TAREFAS
===================================================== */
function renderTasks(phaseIndex) {
  taskListEl().innerHTML = "";

  store.processes[phaseIndex].tasks.forEach((task) => {
    const li = document.createElement("li");
    li.textContent = task.done ? "✓ " + task.name : task.name;
    li.onclick = () => {
      task.done = !task.done;
      store.save();
      renderTasks(phaseIndex);
    };
    taskListEl().appendChild(li);
  });
}

/* =====================================================
   CTA PRINCIPAL
===================================================== */
primaryCTAEl()?.addEventListener("click", () => {
  const phase = store.processes[editingPhaseIndex];
  const isEdit = editingPhaseIndex < store.currentPhaseIndex;

  if (!isEdit && !phase.tasks.every(t => t.done)) {
    alert("Conclui todas as tarefas antes de continuar.");
    return;
  }

  if (!isEdit) {
    store.completeCurrentPhase();
  } else {
    store.save();
  }

  if (store.state.progress.global === 100) {
    showExport();
  } else {
    openPhase(store.currentPhaseIndex, false);
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
   OVERVIEW
===================================================== */
backOverviewEl()?.addEventListener("click", () => {
  executionEl().style.display = "none";
  exportEl().style.display = "none";
  overviewEl().style.display = "block";
  renderOverview();
});

/* =====================================================
   INIT
===================================================== */
window.processBuilder = {
  loadProcesses() {
    if (store.state.progress.global === 100) {
      showExport();
    } else {
      openPhase(store.currentPhaseIndex, false);
    }
  }
};

window.addEventListener("store-updated", () => {
  if (mode === "overview") renderOverview();
});

window.store = store;
