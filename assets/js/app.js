import { store } from "./store.js";

/* =====================================================
   ESTADO GLOBAL DO WIZARD
===================================================== */
let mode = "execution"; // execution | overview
let activePhaseIndex = store.currentPhaseIndex;
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
   OVERVIEW (Progress Builder)
===================================================== */
function renderOverview() {
  processListEl().innerHTML = "";

  store.processes.forEach((phase, index) => {
    const li = document.createElement("li");
    li.textContent = phase.name;

    const state = phaseState(index);

    li.className = `phase-${state}`;

    if (state === "completed") {
      li.onclick = () => openPhase(index, true);
    }

    if (state === "active") {
      li.onclick = () => openPhase(index, false);
    }

    if (state === "locked") {
      li.title = "Conclui o processo anterior para desbloquear";
    }

    processListEl().appendChild(li);
  });
}

/* =====================================================
   EXECUTION (fase ativa ou edição)
===================================================== */
function openPhase(index, isEdit) {
  editingPhaseIndex = index;
  mode = "execution";

  overviewEl().style.display = "none";
  exportEl().style.display = "none";
  executionEl().style.display = "block";

  const phase = store.processes[index];

  phaseTitleEl().textContent = phase.name;

  phaseDescEl().textContent = isEdit
    ? "Estás a editar uma fase já concluída."
    : "Conclui as tarefas desta fase para continuar.";

  renderTasks(index);

  primaryCTAEl().textContent = isEdit
    ? "Guardar"
    : "Guardar e continuar";
}

/* =====================================================
   TASKS
===================================================== */
function renderTasks(phaseIndex) {
  taskListEl().innerHTML = "";

  store.processes[phaseIndex].tasks.forEach((task) => {
    const li = document.createElement("li");

    li.textContent = task.done ? "✓ " + task.name : task.name;
    li.style.cursor = "pointer";
    li.style.opacity = task.done ? "0.6" : "1";

    li.onclick = () => {
      task.done = !task.done;
      store.save();
      renderTasks(phaseIndex);
    };

    taskListEl().appendChild(li);
  });
}

/* =====================================================
   CTA PRINCIPAL (Guardar / Guardar e continuar)
===================================================== */
primaryCTAEl()?.addEventListener("click", () => {
  const phaseIndex = editingPhaseIndex;
  const phase = store.processes[phaseIndex];

  const allDone = phase.tasks.every(t => t.done);

  // modo edição → apenas guarda
  if (phaseIndex < store.currentPhaseIndex) {
    store.save();
    showOverview();
    return;
  }

  // modo execução → valida conclusão
  if (!allDone) {
    alert("Conclui todas as tarefas antes de continuar.");
    return;
  }

  store.completeCurrentPhase();

  if (store.state.progress.global === 100) {
    showExport();
  } else {
    openPhase(store.currentPhaseIndex, false);
  }
});

/* =====================================================
   VOLTAR AO PLANO
===================================================== */
backOverviewEl()?.addEventListener("click", () => {
  showOverview();
});

/* =====================================================
   EXPORT FINAL
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
   VISUAL MODES
===================================================== */
function showOverview() {
  mode = "overview";
  executionEl().style.display = "none";
  exportEl().style.display = "none";
  overviewEl().style.display = "block";
  renderOverview();
}

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
  if (mode === "overview") {
    renderOverview();
  }
});

window.store = store;
``
