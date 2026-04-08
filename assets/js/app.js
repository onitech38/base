import { store } from "./store.js";

/* =========================
   WIZARD STATE
========================= */
let activeProcessIndex = 0;
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
  processListEl().innerHTML = "";

  store.processes.forEach((process, pIndex) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${process.name}</strong>`;

    // Expand tasks
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

window.store = store;
