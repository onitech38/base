import store from "./store.js";

/* PROGRESS UI */
function updateProgressUI() {
  const value = store.state.progress.global;
  const valueEl = document.getElementById("progress-value");
  const fillEl = document.getElementById("progress-fill");
  if (valueEl) valueEl.textContent = `${value}%`;
  if (fillEl) fillEl.style.width = `${value}%`;
}

window.addEventListener("store-updated", updateProgressUI);

/* SETUP */
document.addEventListener("click", (e) => {
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

/* HOME */
function renderHomeDashboard() {
  const container = document.getElementById("home-dashboard");
  if (!container) return;

  container.innerHTML = "";

  store.processes.forEach((phase) => {
    const block = document.createElement("div");
    block.className = "home-phase";

    const h3 = document.createElement("h3");
    h3.textContent = phase.name;
    block.appendChild(h3);

    const ul = document.createElement("ul");
    phase.tasks.forEach((task) => {
      const li = document.createElement("li");
      li.textContent = task.done ? `✅ ${task.name}` : `⬜ ${task.name}`;
      ul.appendChild(li);
    });

    block.appendChild(ul);
    container.appendChild(block);
  });
}

window.renderHomeDashboard = renderHomeDashboard;

/* PROCESS BUILDER */
const overviewEl = () => document.getElementById("pb-overview");
const executionEl = () => document.getElementById("pb-execution");
const exportEl = () => document.getElementById("pb-export");
const processListEl = () => document.getElementById("pb-process-list");
const taskListEl = () => document.getElementById("pb-task-list");
const titleEl = () => document.getElementById("pb-phase-title");
const ctaEl = () => document.getElementById("pb-primary-cta");

let activePhase = null;

function renderOverview() {
  processListEl().innerHTML = "";

  store.processes.forEach((phase, i) => {
    const li = document.createElement("li");
    li.textContent = phase.name;
    if (i <= store.currentPhaseIndex) li.onclick = () => openPhase(i);
    processListEl().appendChild(li);
  });

  overviewEl().style.display = "block";
  executionEl().style.display = "none";
  exportEl().style.display = "none";
}

function openPhase(index) {
  activePhase = index;
  overviewEl().style.display = "none";
  executionEl().style.display = "block";

  const phase = store.processes[index];
  titleEl().textContent = phase.name;

  taskListEl().innerHTML = "";
  phase.tasks.forEach((task) => {
    const li = document.createElement("li");
    li.textContent = task.done ? `✓ ${task.name}` : task.name;
    li.onclick = () => {
      task.done = !task.done;
      store.save();
      openPhase(index);
    };
    taskListEl().appendChild(li);
  });

  ctaEl().textContent =
    index < store.currentPhaseIndex ? "Guardar" : "Guardar e continuar";
}

function bindCTA() {
  ctaEl().onclick = () => {
    const phase = store.processes[activePhase];
    if (activePhase === store.currentPhaseIndex) {
      if (!phase.tasks.every((t) => t.done)) {
        alert("Conclui todas as tarefas.");
        return;
      }
      store.completeCurrentPhase();
    } else {
      store.save();
    }

    if (store.state.progress.global === 100) showExport();
    else renderOverview();
  };
}

function showExport() {
  overviewEl().style.display = "none";
  executionEl().style.display = "none";
  exportEl().style.display = "block";
}

window.processBuilder = {
  loadProcesses() {
    updateProgressUI();
    if (store.processes.length === 0) store.generateProcessesFromProject();
    bindCTA();
    if (store.state.progress.global === 100) showExport();
    else renderOverview();
  },
};
