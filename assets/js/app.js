import { store } from "./store.js";

/* =========================
   SETUP FLOW (OBRIGATÓRIO)
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

  store.completeSetup();
  store.generateProcessesFromProject();

  // 🔴 SEM ISTO O USER FICA PRESO NO SETUP
  location.hash = "#/process-builder";
});

/* =========================
   WIZARD STATE
========================= */
let activeProcessIndex = null;
let activeTaskIndex = null;

/* =========================
   ELEMENTS
========================= */
const processListEl = () => document.getElementById("pb-process-list");
const planViewEl = () => document.getElementById("pb-plan-view");
const taskViewEl = () => document.getElementById("pb-task-view");
const taskTitleEl = () => document.getElementById("pb-task-title");
const taskDescEl = () => document.getElementById("pb-task-description");

/* =========================
   PLAN VIEW
========================= */
function renderPlan() {
  if (!processListEl()) return;

  processListEl().innerHTML = "";

  store.processes.forEach((process, pIndex) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${process.name}</strong>`;

    const ul = document.createElement("ul");

    process.tasks.forEach((task, tIndex) => {
      const taskLi = document.createElement("li");
      taskLi.textContent = task.name;
      taskLi.style.cursor = "pointer";
      taskLi.style.opacity = task.done ? "0.5" : "1";

      if (!task.done) {
        taskLi.onclick = () => openTask(pIndex, tIndex);
      }

      ul.appendChild(taskLi);
    });

    li.appendChild(ul);
    processListEl().appendChild(li);
  });
}

/* =========================
   TASK VIEW
========================= */
function openTask(pIndex, tIndex) {
  activeProcessIndex = pIndex;
  activeTaskIndex = tIndex;

  const task = store.processes[pIndex].tasks[tIndex];

  planViewEl().style.display = "none";
  taskViewEl().style.display = "block";

  taskTitleEl().textContent = task.name;
  taskDescEl().textContent =
    "Executa esta tarefa e marca como concluída quando terminares.";
}

document.addEventListener("click", (e) => {
  if (e.target.id === "pb-task-done") {
    const task =
      store.processes[activeProcessIndex].tasks[activeTaskIndex];

    task.done = true;
    store.updateGlobalProgress();
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
  activeTaskIndex = null;
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
    alert("Conclui todas as tarefas antes de exportar.");
    return;
  }

  alert("Projeto exportado com sucesso (simulação).");
});

window.store = store;
