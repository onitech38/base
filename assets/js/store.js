
const STORE_KEY = "process-builder";

const defaultState = {
  project: {
    name: "",
    type: "",
    goal: "",
    features: {},
    branding: {},
  },
  planning: {
    processes: [],
  },
  progress: {
    onboardingCompleted: false,
    currentPhaseIndex: 0,
    global: 0,
  },
};

const store = {
  state: JSON.parse(localStorage.getItem(STORE_KEY)) || structuredClone(defaultState),

  save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
    window.dispatchEvent(new Event("store-updated"));
  },

  setProjectConfig(project) {
    this.state.project = { ...this.state.project, ...project };
    this.save();
  },

  isSetupComplete() {
    const p = this.state.project;
    return Boolean(p.name && p.type && p.goal);
  },

  completeSetup() {
    this.state.progress.onboardingCompleted = true;
    this.state.progress.currentPhaseIndex = 1;
    this.updatePhaseProgress();
    this.save();
  },

  generateProcessesFromProject() {
    this.state.planning.processes = [
      {
        name: "Setup & Funcionalidades",
        tasks: [{ name: "Confirmar dados", done: true }],
      },
      {
        name: "Estrutura Base",
        tasks: [{ name: "Criar estrutura", done: false }],
      },
      {
        name: "Branding & Tema",
        tasks: [{ name: "Definir cores", done: false }],
      },
      {
        name: "Acessibilidade",
        tasks: [{ name: "Contraste", done: false }],
      },
      {
        name: "SEO",
        tasks: [{ name: "Meta tags", done: false }],
      },
      {
        name: "Export",
        tasks: [{ name: "Exportar projeto", done: false }],
      },
    ];
    this.updatePhaseProgress();
    this.save();
  },

  updatePhaseProgress() {
    const total = this.state.planning.processes.length;
    this.state.progress.global = Math.round(
      (this.state.progress.currentPhaseIndex / total) * 100
    );
  },

  completeCurrentPhase() {
    if (this.state.progress.currentPhaseIndex < this.state.planning.processes.length) {
      this.state.progress.currentPhaseIndex++;
      this.updatePhaseProgress();
      this.save();
    }
  },

  get processes() {
    return this.state.planning.processes;
  },

  get currentPhaseIndex() {
    return this.state.progress.currentPhaseIndex;
  },
};

export default store;
