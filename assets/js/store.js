const STORE_KEY = "process-builder";

const defaultState = {
  project: {
    name: "",
    type: "",
    goal: "",
    features: {
      login: false,
      backend: false,
      pwa: false,
    },
    branding: {
      primaryColor: "",
      secondaryColor: "",
      fontPrimary: "",
    },
    theme: {
      supportsDarkMode: true,
    },
    stack: {},
  },

  planning: {
    processes: [],
  },

  progress: {
    currentPhaseIndex: 0, // ✅ número, não string
    global: 0,
  },
};

export const store = {
  state: load(),

  /* =========================
     Persistência
  ========================= */
  save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
    window.dispatchEvent(new Event("store-updated"));
  },

  /* =========================
     Setup
  ========================= */
  setProjectConfig(project) {
    this.state.project = { ...this.state.project, ...project };
    this.save();
  },

  isSetupComplete() {
    const p = this.state.project;
    return Boolean(p.name && p.type && p.goal);
  },

  completeSetup() {
    // primeira fase (Setup) conta como concluída
    this.state.progress.currentPhaseIndex = 1;
    this.updatePhaseProgress();
    this.save();
  },

  /* =========================
     Branding
  ========================= */
  setBranding(branding, supportsDarkMode) {
    this.state.project.branding = {
      ...this.state.project.branding,
      ...branding,
    };
    this.state.project.theme.supportsDarkMode = supportsDarkMode;
    this.save();
  },

  hasBranding() {
    const b = this.state.project.branding;
    return Boolean(b.primaryColor || b.fontPrimary);
  },

  /* =========================
     Planeamento
  ========================= */
  generateProcessesFromProject() {
    const p = this.state.project;
    const processes = [];

    processes.push({
      name: "Setup & Funcionalidades",
      tasks: [
        { name: "Confirmar nome do projeto", done: true },
        { name: "Confirmar tipo de projeto", done: true },
        { name: "Confirmar objetivo do projeto", done: true },
      ],
    });

    processes.push({
      name: "Estrutura Base",
      tasks: [
        { name: "Criar estrutura base", done: false },
        { name: "Configurar layout base", done: false },
      ],
    });

    processes.push({
      name: "Branding & Tema",
      tasks: [
        { name: "Definir cores base", done: false },
        { name: "Definir tipografia principal", done: false },
        { name: "Configurar light / dark mode", done: false },
      ],
    });

    processes.push({
      name: "Acessibilidade",
      tasks: [
        { name: "Verificar contraste de cores", done: false },
        { name: "Garantir labels em inputs", done: false },
        { name: "Verificar navegação por teclado", done: false },
        { name: "Adicionar atributos ARIA essenciais", done: false },
      ],
    });

    processes.push({
      name: "SEO",
      tasks: [
        { name: "Definir title e description", done: false },
        { name: "Verificar hierarquia de headings", done: false },
        { name: "Adicionar meta tags básicas", done: false },
        { name: "Estrutura HTML semântica", done: false },
      ],
    });

    processes.push({
      name: "Export",
      tasks: [
        { name: "Rever progresso final", done: false },
        { name: "Validar base do projeto", done: false },
      ],
    });

    this.state.planning.processes = processes;
    this.updatePhaseProgress();
    this.save();
  },

  /* =========================
     Progresso por fases ✅
  ========================= */
  updatePhaseProgress() {
    const totalPhases = this.state.planning.processes.length;
    const completed = this.state.progress.currentPhaseIndex;

    this.state.progress.global = Math.round(
      (completed / totalPhases) * 100
    );
  },

  completeCurrentPhase() {
    const next = this.state.progress.currentPhaseIndex + 1;

    if (next <= this.state.planning.processes.length) {
      this.state.progress.currentPhaseIndex = next;
      this.updatePhaseProgress();
      this.save();
    }
  },

  /* =========================
     Getters
  ========================= */
  get processes() {
    return this.state.planning.processes;
  },

  get currentPhaseIndex() {
    return this.state.progress.currentPhaseIndex;
  },
};

function load() {
  const saved = JSON.parse(localStorage.getItem(STORE_KEY));
  return saved ? saved : structuredClone(defaultState);
}
``
