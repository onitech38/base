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

export const store = {
  state: load(),

  /* =========================
     PERSISTÊNCIA
  ========================= */
  save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
    window.dispatchEvent(new Event("store-updated"));
  },

  /* =========================
     SETUP
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
    this.state.progress.onboardingCompleted = true;
    this.state.progress.currentPhaseIndex = 1; // primeira fase real
    this.updatePhaseProgress();
    this.save();
  },

  /* =========================
     BRANDING
  ========================= */
  setBranding(branding, supportsDarkMode) {
    this.state.project.branding = {
      ...this.state.project.branding,
      ...branding,
    };
    this.state.project.theme.supportsDarkMode = supportsDarkMode;
    this.save();
  },

  /* =========================
     PLANEAMENTO (FASES)
  ========================= */
  generateProcessesFromProject() {
    const processes = [];

    processes.push({
      name: "Setup & Funcionalidades",
      tasks: [
        { name: "Confirmar nome do projeto", done: true },
        { name: "Confirmar tipo do projeto", done: true },
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
        { name: "Verificar contraste", done: false },
        { name: "Garantir labels", done: false },
        { name: "Navegação por teclado", done: false },
        { name: "ARIA essenciais", done: false },
      ],
    });

    processes.push({
      name: "SEO",
      tasks: [
        { name: "Definir title e description", done: false },
        { name: "Hierarquia de headings", done: false },
        { name: "Meta tags básicas", done: false },
        { name: "HTML semântico", done: false },
      ],
    });

    processes.push({
      name: "Export",
      tasks: [
        { name: "Revisão final", done: false },
        { name: "Validar base", done: false },
      ],
    });

    this.state.planning.processes = processes;
    this.updatePhaseProgress();
    this.save();
  },

  /* =========================
     PROGRESSO POR FASE (✔)
  ========================= */
  updatePhaseProgress() {
    const total = this.state.planning.processes.length;
    const completed = this.state.progress.currentPhaseIndex;

    this.state.progress.global = Math.round(
      (completed / total) * 100
    );
  },

  completeCurrentPhase() {
    if (
      this.state.progress.currentPhaseIndex <
      this.state.planning.processes.length
    ) {
      this.state.progress.currentPhaseIndex++;
      this.updatePhaseProgress();
      this.save();
    }
  },

  /* =========================
     GETTERS
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
