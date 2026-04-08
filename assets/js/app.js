import { store } from "./store.js";

/* =========================
   STATE
========================= */
let currentProcess = null;

/* =========================
   HELPERS
========================= */
const getProcesses = () => store.processes;
const listEl = () => document.getElementById("pb-process-list");
const taskEl = () => document.getElementById("pb-task-list");
const titleEl = () => document.getElementById("pb-current-title");
const taskAreaEl = () => document.getElementById("pb-task-area");

/* =========================
   PROCESS LIST
========================= */
function renderProcesses() {
  if (!listEl()) return;

  listEl().innerHTML = "";

  getProcesses().forEach((p, i) => {
    const div = document.createElement("div");
    div.textContent = p.name;
    div.className = "pb-process-item";
    div.onclick = () => openProcess(i);
    listEl().appendChild(div);
  });
}

/* =========================
   OPEN PROCESS
========================= */
function openProcess(index) {
  currentProcess = index;

  const process = getProcesses()[index];
  titleEl().textContent = process.name;

  // UX: mostrar tarefas, esconder lista
  listEl().style.display = "none";
  taskAreaEl().style.display = "block";

  updateHint(process.name);
  renderTasks();
}

/* =========================
   TASKS
========================= */
function renderTasks() {
  taskEl().innerHTML = "";

  getProcesses()[currentProcess].tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t.name;
    li.style.cursor = "pointer";

    if (t.done) {
      li.style.textDecoration = "line-through";
      li.style.opacity = "0.6";
    }

    li.onclick = () => toggleTask(i);
    taskEl().appendChild(li);
  });
}

function toggleTask(i) {
  const task = getProcesses()[currentProcess].tasks[i];
  task.done = !task.done;

  store.updateGlobalProgress();
  store.save();

  renderTasks();
}

/* =========================
   HINT TEXT
========================= */
function updateHint(processName) {
  const hint = document.getElementById("pb-hint");
  if (!hint) return;

  hint.textContent = `Estás no processo "${processName}". Marca cada tarefa quando estiver concluída.`;
}

/* =========================
   BACK TO PROCESS LIST
========================= */
document.addEventListener("click", (e) => {
  if (e.target.id !== "pb-back") return;

  taskAreaEl().style.display = "none";
  listEl().style.display = "block";
  titleEl().textContent = "Processos";
});

/* =========================
   PUBLIC API
========================= */
window.processBuilder = {
  loadProcesses() {
    renderProcesses();

    // ABRIR AUTOMATICAMENTE O PRIMEIRO PROCESSO
    if (store.processes.length > 0) {
      openProcess(0);
    }
  },
};

/* =========================
   SETUP
========================= */
document.addEventListener("click", (e) => {
  if (e.target.id !== "setup-submit") return;

  const project = {
    name: document.getElementById("setup-name").value.trim(),
    type: document.getElementById("setup-type").value,
    goal: document.getElementById("setup-goal").value,
    features: {
      login: document.getElementById("feature-login").checked,
      backend: document.getElementById("feature-backend").checked,
      pwa: document.getElementById("feature-pwa").checked,
    },
  };

  store.setProjectConfig(project);

  if (!store.isSetupComplete()) {
    alert("Preenche nome, tipo e objetivo do projeto.");
    return;
  }

  store.completeSetup();
  store.generateProcessesFromProject();
  location.hash = "process-builder";
});

/* =========================
   BRANDING
========================= */
document.addEventListener("click", (e) => {
  if (e.target.id !== "branding-save") return;

  const branding = {
    primaryColor: document.getElementById("brand-primary")?.value || "",
    secondaryColor: document.getElementById("brand-secondary")?.value || "",
    fontPrimary: document.getElementById("brand-font")?.value || "",
  };

  const supportsDark =
    document.getElementById("brand-darkmode")?.checked ?? true;

  store.setBranding(branding, supportsDark);
  store.generateProcessesFromProject();
  location.hash = "process-builder";
});

/* =========================
   EXPORT
========================= */
document.addEventListener("click", (e) => {
  if (e.target.id !== "export-btn") return;

  if (store.state.progress.global < 100) {
    alert("Conclui todas as tarefas antes de exportar o projeto.");
    return;
  }

  alert("Projeto exportado com sucesso (simulação).");
});

window.store = store;
