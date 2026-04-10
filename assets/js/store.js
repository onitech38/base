const STORE_KEY = "project-builder";

/* =====================
   STATE BASE
===================== */
const defaultState = {
  auth: {
    status: "guest", // "guest" | "authenticated"
    activeUserId: null,
    activeProjectId: null,
  },

  users: {}, // { [userId]: user }
  projects: {}, // { [projectId]: project }
};

/* =====================
   STORE
===================== */
const store = {
  state: loadState(),

  /* ---------- persistência ---------- */
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
      password, // simples e local (por agora)
      projectIds: [],
      createdAt: Date.now(),
    };

    this.state.auth.status = "authenticated";
    this.state.auth.activeUserId = userId;
    this.state.auth.activeProjectId = null;

    this.save();
  },

  login({ firstName, password }) {
    const user = Object.values(this.state.users).find(
      (u) => u.firstName === firstName && u.password === password,
    );

    if (!user) return false;

    this.state.auth.status = "authenticated";
    this.state.auth.activeUserId = user.id;
    this.state.auth.activeProjectId = null;

    this.save();
    return true;
  },

  logout() {
    this.state.auth = {
      status: "guest",
      activeUserId: null,
      activeProjectId: null,
    };
    this.save();
  },

  /* =====================
     PROJECT
  ===================== */
  createProject() {
    const user = this.currentUser;
    if (!user) return;
    if (user.projectIds.length >= 2) return;

    const projectId = crypto.randomUUID();

    this.state.projects[projectId] = {
      id: projectId,
      ownerId: user.id,

      name: "",
      type: "",
      goal: "",
      setupCompleted: false,

      process: {
        phases: createInitialPhases(),
      },

      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    user.projectIds.push(projectId);
    this.state.auth.activeProjectId = projectId;

    this.save();
  },

  selectProject(projectId) {
    if (!this.state.projects[projectId]) return;
    this.state.auth.activeProjectId = projectId;
    this.save();
  },

  completeSetup({ name, type, goal }) {
    const project = this.currentProject;
    if (!project) return;

    project.name = name;
    project.type = type;
    project.goal = goal;
    project.setupCompleted = true;
    project.updatedAt = Date.now();

    this.save();
  },

  /* =====================
     PHASES (PROGRESSÃO)
  ===================== */
  completePhase(phaseId) {
    const project = this.currentProject;
    if (!project) return;

    const phases = project.process.phases;
    const index = phases.findIndex((p) => p.id === phaseId);

    if (index === -1) return;
    if (phases[index].status !== "active") return;

    // concluir fase atual
    phases[index].status = "completed";

    // desbloquear próxima (uma única vez)
    if (phases[index + 1]) {
      if (phases[index + 1].status === "locked") {
        phases[index + 1].status = "active";
      }
    }

    project.updatedAt = Date.now();
    this.save();
  },

  /* =====================
     DERIVED STATE
  ===================== */
  get currentUser() {
    return this.state.users[this.state.auth.activeUserId] || null;
  },

  get currentProject() {
    return this.state.projects[this.state.auth.activeProjectId] || null;
  },

  get phases() {
    const project = this.currentProject;
    return project ? project.process.phases : [];
  },

  get currentPhase() {
    return this.phases.find((p) => p.status === "active") || null;
  },

  get isProjectCompleted() {
    return (
      this.phases.length > 0 &&
      this.phases.every((p) => p.status === "completed")
    );
  },
};

/* =====================
   HELPERS
===================== */
function createInitialPhases() {
  return [
    {
      id: "setup",
      title: "Setup & Funcionalidades",
      status: "active",
    },
    {
      id: "structure",
      title: "Estrutura Base",
      status: "locked",
    },
    {
      id: "branding",
      title: "Branding & Temas",
      status: "locked",
    },
    {
      id: "accessibility",
      title: "Acessibilidade",
      status: "locked",
    },
    {
      id: "seo",
      title: "SEO",
      status: "locked",
    },
  ];
}

function loadState() {
  const saved = localStorage.getItem(STORE_KEY);
  return saved ? JSON.parse(saved) : structuredClone(defaultState);
}

export default store;
