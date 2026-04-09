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
    currentPhaseIndex: "0", 
    global: 0,
  },
};

export const store = {
  state: load(),

  save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
    window.dispatchEvent(new Event("store-updated"));
  },

  validate() {
    if (!Array.isArray(this.state.planning.processes)) {
      this.state.planning.processes = [];
    }
  },

  /* ========= SETUP ========= */
  setProjectConfig(project) {
    this.state.project = { ...this.state.project, ...project };
    this.save();
  },

  isSetupComplete() {
    const p = this.state.project;
    return Boolean(p.name && p.type && p.goal);
  },

  completeSetup() {
    this.state.progress.currentPhase = "planning";
    this.save();
  },

  /* ========= BRANDING ========= */
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

  /* ========= PLANEAMENTO ========= */
  generateProcessesFromProject() {
    const p = this.state.project;
    const processes = [];

    processes.push({
      name: "Setup & Fundamentos",
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

    if (this.hasBranding() || p.theme.supportsDarkMode) {
      processes.push({
        name: "Branding & Tema",
        tasks: [
          {
            name: "Definir cores base",
            done: Boolean(p.branding.primaryColor),
          },
          {
            name: "Definir tipografia principal",
            done: Boolean(p.branding.fontPrimary),
          },
          {
            name: "Configurar light / dark mode",
            done: p.theme.supportsDarkMode,
          },
        ],
      });
    }

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
        { name: "Exportar estrutura final", done: false },
      ],
    });

    this.state.planning.processes = processes;
    this.updateGlobalProgress();
    this.save();
  },

  updateGlobalProgress() {
    let total = 0;
    let done = 0;

    this.state.planning.processes.forEach((p) =>
      p.tasks.forEach((t) => {
        total++;
        if (t.done) done++;
      }),
    );

    this.state.progress.global = total ? Math.round((done / total) * 100) : 0;
  },

  get processes() {
    return this.state.planning.processes;
  },
};

function load() {
  const saved = JSON.parse(localStorage.getItem(STORE_KEY));
  return saved ? saved : structuredClone(defaultState);
}
