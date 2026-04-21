const STORE_KEY = "project-builder";

/* =====================
   DEFAULT STATE
===================== */
const defaultState = {
  auth: {
    status: "guest",
    activeUserId: null,
    activeProjectId: null,
  },
  users: {},
  projects: {},
};

/* =====================
   STORE
===================== */
const store = {
  state: loadState(),

  /* ---------- persist ---------- */
  save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
    window.dispatchEvent(new Event("store-updated"));
  },

  /* =====================
     AUTH
  ===================== */
  signUp({ firstName, lastName, password }) {
    const userId = crypto.randomUUID();

    this.state.users[userId] = {
      id: userId,
      firstName,
      lastName,
      password,
      projectIds: [],
    };

    this.state.auth = {
      status: "authenticated",
      activeUserId: userId,
      activeProjectId: null,
    };

    if (!p.__migrated) {
      p.__migrated = true;
      this.save();
    }
  },

  login({ firstName, password }) {
    const user = Object.values(this.state.users).find(
      (u) => u.firstName === firstName && u.password === password,
    );

    if (!user) return false;

    this.state.auth = {
      status: "authenticated",
      activeUserId: user.id,
      activeProjectId: null,
    };

    if (!p.__migrated) {
      p.__migrated = true;
      this.save();
    }

    return true;
  },

  logout() {
    this.state.auth = {
      status: "guest",
      activeUserId: null,
      activeProjectId: null,
    };

    if (!p.__migrated) {
      p.__migrated = true;
      this.save();
    }
  },

  /* =====================
     PROJECT
  ===================== */
  createProject() {
    const user = this.currentUser;
    if (!user) return;

    const projectId = crypto.randomUUID();

    this.state.projects[projectId] = {
      id: projectId,
      name: "",
      productType: null,
      contentModel: null,
      userAccess: null,
      goal: "",
      features: {},
      strategy: {},

      setupCompleted: false,

      layout: {
        grid: {
          type: "", // ex: single-column, 12-col, split
          maxWidth: "", // ex: 1200px
          notes: "",
        },
        pages: {}, // pageId -> layout definition
        globalComponents: {
          header: false,
          footer: false,
          navigation: false,
        },
        hierarchy: {
          primaryFocus: "",
          secondaryFocus: "",
        },
        completed: false,
      },

      branding: {
        tone: "",
        colors: {
          primary: "",
          secondary: "",
        },
        typography: "",
        visualMode: "",
        wcagTarget: "",
        completed: false,
      },

      accessibility: {
        contrast: {
          text: "",
          primary: "",
          secondary: "",
        },
        typography: {
          readable: null,
        },
        focus: {
          visible: false,
          linksDistinct: false,
          hoverOnly: false,
        },
        keyboard: {
          order: false,
          traps: false,
        },
        nonText: {
          strategyDefined: false,
        },
        completed: false,
      },

      baseStructure: {
        architecture: {
          type: "",
          approach: "",
          notes: "",
        },
        pages: [],
        navigation: {
          pattern: "",
          hierarchy: "",
          notes: "",
        },
        foundation: {
          mindset: "",
          constraints: "",
          assumptions: "",
        },
        completed: false,
      },

      process: {
        phases: createPhases(),
      },
    };

    user.projectIds.push(projectId);
    this.state.auth.activeProjectId = projectId;

    if (!p.__migrated) {
      p.__migrated = true;
      this.save();
    }
  },

  completeSetup(data) {
    const p = this.currentProject;
    if (!p) return;

    Object.assign(p, data);
    p.setupCompleted = true;
    this.completePhase("setup"); // 🔑

    if (!p.__migrated) {
      p.__migrated = true;
      this.save();
    }
  },

  completePhase(id) {
    const phases = this.currentProject?.process.phases;
    if (!phases) return;

    const index = phases.findIndex((phase) => phase.id === id);
    if (index === -1) return;

    phases[index].status = "completed";

    if (phases[index + 1] && phases[index + 1].status === "locked") {
      phases[index + 1].status = "active";
    }

    this.save();
  },

  checkAutoCompleteStructure() {
    const project = this.currentProject;
    if (!project) return;

    const bs = project.baseStructure;
    if (!bs) return;

    const tasks = this.structureTasks;
    const allDone = tasks.length > 0 && tasks.every((t) => t.done);

    if (allDone && !bs.completed) {
      bs.completed = true;
      this.completePhase("structure");
    }
  },

  checkAutoCompleteBranding() {
    const b = this.currentProject.branding;

    if (
      b.tone &&
      b.colors.primary &&
      b.colors.secondary &&
      b.typography &&
      b.visualMode &&
      b.wcagTarget
    ) {
      b.completed = true;
      this.completePhase("branding");
    }
  },

  checkAutoCompleteAccessibility() {
    const a = this.currentProject.accessibility;

    if (
      a.contrast.text &&
      a.contrast.primary &&
      a.contrast.secondary &&
      a.typography.readable !== null &&
      a.keyboard.order &&
      a.keyboard.traps &&
      a.nonText.strategyDefined
    ) {
      a.completed = true;
      this.completePhase("accessibility");
    }
  },

  /* =====================
     BASE STRUCTURE
  ===================== */
  updateBaseStructure(section, data) {
    const bs = this.currentProject?.baseStructure;
    if (!bs || !bs[section]) return;

    Object.assign(bs[section], data);
    this.checkAutoCompleteStructure();

    if (!p.__migrated) {
      p.__migrated = true;
      this.save();
    }
  },

  addPageToStructure(page) {
    const pages = this.currentProject?.baseStructure.pages;
    if (!pages) return;

    pages.push(page);
    this.checkAutoCompleteStructure();

    if (!p.__migrated) {
      p.__migrated = true;
      this.save();
    }
  },

  markBaseStructureCompleted() {
    const bs = this.currentProject?.baseStructure;
    if (!bs) return;

    bs.completed = true;
    this.completePhase("structure");
  },

  /* =====================
     DERIVED STATE - GETTER
  ===================== */
  get currentUser() {
    return this.state.users[this.state.auth.activeUserId] || null;
  },

  get currentProject() {
    const p = this.state.projects[this.state.auth.activeProjectId] || null;
    if (!p) return null;

    /* =====================
       MIGRAÇÃO DEFENSIVA
    ===================== */

    // BRANDING
    if (!p.branding) {
      p.branding = {
        tone: "",
        colors: { primary: "", secondary: "" },
        typography: "",
        visualMode: "",
        wcagTarget: "",
        completed: false,
      };
    } else {
      if (!p.branding.colors) {
        p.branding.colors = { primary: "", secondary: "" };
      }
      if (!("visualMode" in p.branding)) {
        p.branding.visualMode = "";
      }
      if (!("wcagTarget" in p.branding)) {
        p.branding.wcagTarget = "";
      }
    }

    // ACESSIBILIDADE
    if (!p.accessibility) {
      p.accessibility = {
        contrast: {
          text: "",
          primary: "",
          secondary: "",
        },
        typography: {
          readable: null,
        },
        focus: {
          visible: false,
          linksDistinct: false,
          hoverOnly: false,
        },
        keyboard: {
          order: false,
          traps: false,
        },
        nonText: {
          strategyDefined: false,
        },
        completed: false,
      };
    }

    // opcional mas recomendado

    if (!p.__migrated) {
      p.__migrated = true;
      this.save();
    }

    return p;
  },

  get phases() {
    return this.currentProject?.process.phases || [];
  },

  get baseStructure() {
    return this.currentProject?.baseStructure || null;
  },

  get structureTasks() {
    const bs = this.baseStructure;
    if (!bs) return [];

    return [
      {
        id: "architecture",
        label: "Arquitetura do Projeto",
        done:
          !!bs.architecture.type ||
          !!bs.architecture.approach ||
          !!bs.architecture.notes,
      },
      {
        id: "pages",
        label: "Organização de páginas / vistas",
        done: bs.pages.length > 0,
      },
      {
        id: "navigation",
        label: "Estrutura lógica e navegação",
        done:
          !!bs.navigation.pattern ||
          !!bs.navigation.hierarchy ||
          !!bs.navigation.notes,
      },
      {
        id: "foundation",
        label: "Fundação técnica e mental do projeto",
        done:
          !!bs.foundation.mindset ||
          !!bs.foundation.constraints ||
          !!bs.foundation.assumptions,
      },
    ];
  },

  get layoutTasks() {
    const l = this.currentProject?.layout;
    if (!l) return [];

    return [
      {
        id: "grid",
        label: "Definir grelha base do layout",
        done: !!l.grid.type && !!l.grid.maxWidth,
      },
      {
        id: "pages",
        label: "Definir layout das páginas",
        done: Object.keys(l.pages).length > 0,
      },
      {
        id: "global",
        label: "Definir componentes globais",
        done:
          l.globalComponents.header ||
          l.globalComponents.footer ||
          l.globalComponents.navigation,
      },
      {
        id: "hierarchy",
        label: "Definir hierarquia visual",
        done: !!l.hierarchy.primaryFocus || !!l.hierarchy.secondaryFocus,
      },
    ];
  },

  get setupTasks() {
    const p = this.currentProject;
    if (!p) return [];

    return [
      { label: "Nome do projeto", done: !!p.name },
      { label: "Tipo de projeto", done: !!p.productType },
      { label: "Objetivo principal", done: !!p.goal },
    ];
  },

  get brandingTasks() {
    const b = this.currentProject?.branding;
    if (!b) return [];

    return [
      {
        label: "Definir tom do projeto",
        done: !!b.tone,
      },
      {
        label: "Definir paleta de cores base",
        done: !!b.colors.primary && !!b.colors.secondary,
      },
      {
        label: "Definir tipografia base",
        done: !!b.typography,
      },
      {
        label: "Definir modo visual e intenção WCAG",
        done: !!b.visualMode && !!b.wcagTarget,
      },
    ];
  },

  get accessibilityTasks() {
    const a = this.currentProject?.accessibility;
    if (!a) return [];

    return [
      {
        label: "Contraste de cores",
        done:
          !!a.contrast.text && !!a.contrast.primary && !!a.contrast.secondary,
      },
      {
        label: "Legibilidade tipográfica",
        done: a.typography.readable !== null,
      },
      {
        label: "Estados interativos",
        done: a.focus.visible && a.focus.linksDistinct,
      },
      {
        label: "Navegação por teclado",
        done: a.keyboard.order && a.keyboard.traps,
      },
      {
        label: "Conteúdo não textual",
        done: a.nonText.strategyDefined,
      },
    ];
  },

  //TODAS AS FASES - RENDERIZAÇÃO DA LISTA DE TAREFAS

  get phaseTasks() {
    return {
      setup: this.setupTasks,
      structure: this.structureTasks,
      layout: this.layoutTasks,
      branding: this.brandingTasks,
      accessibility: this.accessibilityTasks,
    };
  },

  checkAutoCompleteLayout() {
    const tasks = this.layoutTasks;
    const allDone = tasks.length > 0 && tasks.every((t) => t.done);

    if (allDone) {
      const phase = this.phases.find((p) => p.id === "layout");
      if (phase && phase.status !== "completed") {
        this.currentProject.layout.completed = true;
        this.completePhase("layout");
      }
    }
  },
};

/* =====================
   HELPERS
===================== */
function createPhases() {
  return [
    { id: "setup", title: "Setup", status: "active" },
    { id: "structure", title: "Estrutura Base", status: "locked" },
    { id: "layout", title: "Layout", status: "locked" },
    { id: "branding", title: "Branding", status: "locked" },
    { id: "accessibility", title: "Acessibilidade", status: "locked" },
  ];
}

function loadState() {
  const saved = localStorage.getItem(STORE_KEY);
  return saved ? JSON.parse(saved) : structuredClone(defaultState);
}

export default store;
