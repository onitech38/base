/* ============================================================
   BOOT / GLOBAL STATE
============================================================ */
import store from "./store.js";
window.store = store;
window.pendingPhaseToOpen = null;

/* ============================================================
    WELCOME
============================================================ */

document.addEventListener("click", (e) => {
  if (e.target.id === "welcome-login") {
    location.hash = "#/login";
    return;
  }
  if (e.target.id === "welcome-signup") {
    location.hash = "#/signup";
    return;
  }
});

/* ============================================================
   GENERIC UI HELPERS (ÚNICOS)
============================================================ */
function showBlock(prefix, blockName) {
  const el = document.querySelector(
    `.${prefix}-block[data-block="${blockName}"]`,
  );
  if (el) el.classList.remove("is-hidden");
}

function updateVisibility(prefix, rules) {
  rules.forEach(({ condition, block }) => {
    if (condition()) showBlock(prefix, block);
  });
}

/* ============================================================
   PHASE RULES (FONTE DA VERDADE DO FLUXO)
============================================================ */
const structureRules = [
  {
    block: "pages",
    condition: () =>
      store.baseStructure.architecture.type &&
      store.baseStructure.architecture.approach,
  },
  {
    block: "navigation",
    condition: () => store.baseStructure.pages.length > 0,
  },
  {
    block: "foundation",
    condition: () =>
      store.baseStructure.navigation.pattern &&
      store.baseStructure.navigation.hierarchy,
  },
];

const layoutRules = [
  {
    block: "pages",
    condition: () => {
      const l = store.currentProject.layout;
      return l.grid.type && l.grid.maxWidth;
    },
  },
  {
    block: "globals",
    condition: () => {
      const l = store.currentProject.layout;
      return Object.keys(l.pages || {}).length > 0;
    },
  },
  {
    block: "hierarchy",
    condition: () => {
      const l = store.currentProject.layout;
      return (
        l.globalComponents.header ||
        l.globalComponents.navigation ||
        l.globalComponents.footer
      );
    },
  },
];

const brandingRules = [
  {
    block: "colors",
    condition: () => !!store.currentProject.branding.tone,
  },
  {
    block: "type",
    condition: () =>
      store.currentProject.branding.colors.primary &&
      store.currentProject.branding.colors.secondary,
  },
];

/* ============================================================
   GLOBAL NAV
============================================================ */
function updateNav() {
  const user = store.currentUser;
  const project = store.currentProject;

  const navHome = document.getElementById("nav-home");
  const navUsername = document.getElementById("nav-username");
  const navProgress = document.getElementById("nav-progress");

  const navProcess = document.getElementById("nav-process");
  const navLogout = document.getElementById("nav-logout");
  if (!navHome || !navProcess || !navLogout) return;

  const isAuth = store.state.auth.status === "authenticated";
  const hasProject = !!project;

  navHome.style.display = isAuth ? "inline-flex" : "none";
  navProcess.style.display = hasProject ? "inline-block" : "none";
  navLogout.style.display = isAuth ? "inline-block" : "none";

  // ✅ nome do user (sem destruir o DOM)
  if (user && navUsername) {
    navUsername.textContent = user.firstName;
  }

  // ✅ percentagem do projeto
  if (navProgress) {
    const percent = getProjectProgressPercent();
    navProgress.textContent = percent !== null ? `${percent}%` : "";
  }

  navHome.onclick = () => (location.hash = "#/home");
  navProcess.onclick = () => (location.hash = "#/process-builder");
  navLogout.onclick = () => {
    store.logout();
    location.hash = "#/welcome";
  };
}

window.updateNav = updateNav;

window.addEventListener("store-updated", updateNav);

function getProjectProgressPercent() {
  const project = store.currentProject;
  if (!project) return null;

  const phases = project.process.phases;
  if (!phases || phases.length === 0) return 0;

  const completed = phases.filter((p) => p.status === "completed").length;

  return Math.round((completed / phases.length) * 100);
}

/* ============================================================
   LOGIN+
============================================================ */
window.renderLoginPlus = function () {
  const user = store.currentUser;
  if (!user) {
    location.hash = "#/welcome";
    return;
  }

  document.getElementById("login-plus-username").textContent = user.firstName;

  const container = document.getElementById("project-links");
  container.innerHTML = "";

  // ✅ PROJETOS EXISTENTES
  user.projectIds.forEach((projectId) => {
    const project = store.state.projects[projectId];
    if (!project) return;

    const completed = project.process.phases.filter(
      (p) => p.status === "completed",
    ).length;

    const total = project.process.phases.length;
    const percent = Math.round((completed / total) * 100);

    const el = document.createElement("div");
    el.className = "project-link";
    el.innerHTML = `
      <span>${project.name || "Projeto sem nome"}</span>
      <span class="progress">${percent}%</span>
    `;

    el.onclick = () => {
      store.state.auth.activeProjectId = projectId;
      store.save();

      location.hash = project.setupCompleted ? "#/home" : "#/setup";
    };

    container.appendChild(el);
  });

  // ✅ NOVO PROJETO
  if (user.projectIds.length < 2) {
    const create = document.createElement("div");
    create.className = "project-link new";
    create.innerHTML = `
      <span>Novo projeto?</span>
      <span class="progress">+</span>
    `;

    create.onclick = () => {
      const before = store.currentUser.projectIds.length;

      store.createProject();

      const after = store.currentUser.projectIds.length;

      // ✅ só avança se o projeto foi realmente criado
      if (after > before) {
        location.hash = "#/setup";
      }
    };

    container.appendChild(create);
  }
  // bindLoginPlusEvents();
};

// function bindLoginPlusEvents() {
//   document.getElementById("logout").onclick = () => {
//     store.logout();
//     location.hash = "#/welcome";
//   };

//   document.getElementById("create-project").onclick = () => {
//     const input = document.getElementById("new-project-name");
//     const name = input.value.trim();

//     if (!name) {
//       alert("Dá um nome ao projeto");
//       return;
//     }

//     store.createProject();
//     store.currentProject.name = name;
//     store.save();

//     location.hash = "#/setup";
//   };
// }

/* ============================================================
   SETUP (FASE 1)
============================================================ */
window.renderSetup = function () {
  // ✅ GARANTIR QUE EXISTE PROJETO (uma única vez)
  if (!store.currentProject) {
    store.createProject();
  }

  const project = store.currentProject;
  if (!project) {
    // segurança extrema (não devia acontecer)
    location.hash = "#/login-plus";
    return;
  }

  // hidratar campos se existirem
  const set = (id, value = "") => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  };

  set("setup-name", project.name);
  set("setup-type", project.productType);
  set("setup-goal", project.goal);

  const submitBtn = document.getElementById("setup-submit");
  if (!submitBtn) return;

  submitBtn.onclick = () => {
    const name = document.getElementById("setup-name")?.value.trim();
    const type = document.getElementById("setup-type")?.value;
    const goal = document.getElementById("setup-goal")?.value.trim();

    if (!name) {
      alert("O projeto precisa de um nome.");
      return;
    }

    store.completeSetup({
      name,
      productType: type,
      goal,
    });

    // ✅ depois do setup → HOME
    location.hash = "#/home";
  };
};

/* ============================================================
   HOME
============================================================ */
window.renderHome = function () {
  const project = store.currentProject;
  const user = store.currentUser;

  if (!project || !project.setupCompleted) {
    // segurança extra (não devia acontecer)
    location.hash = "#/login-plus";
    return;
  }

  renderHomeMeta(project);
  renderHomeProgress();
  renderHomePhases();
};

function renderHomeProgress() {
  const phases = store.phases;
  const completed = phases.filter((p) => p.status === "completed").length;
  const percent = Math.round((completed / phases.length) * 100);

  const value = document.getElementById("home-progress-value");
  const fill = document.getElementById("home-progress-fill");

  if (value) value.textContent = `${percent}%`;
  if (fill) fill.style.width = `${percent}%`;
}

function renderHomeMeta(project) {
  const el = document.getElementById("home-project-meta");
  if (!el) return;

  el.innerHTML = `
    <p class="meta-label">Nome do projeto</p>
    <p class="meta-value">${project.name || "—"}</p>

    <p class="meta-label">Tipo de projeto</p>
    <p class="meta-value">${project.productType || "—"}</p>

    <p class="meta-label">Objetivo principal</p>
    <p class="meta-value">${project.goal || "—"}</p>
  `;
}

function renderHomePhases() {
  const container = document.getElementById("home-phases");
  if (!container) return;

  container.innerHTML = "";

  store.phases.forEach((phase) => {
    const el = document.createElement("div");
    el.className = `phase-group ${phase.status}`;

    const tasks = store.phaseTasks?.[phase.id] || [];
    const tasksHtml = tasks.length
      ? `<ul class="phase-tasks">
          ${tasks
            .map((t) => `<li class="${t.done ? "done" : ""}">${t.label}</li>`)
            .join("")}
        </ul>`
      : "";

    el.innerHTML = `
      <div class="phase-header">
        <span class="phase-check ${
          phase.status === "completed" ? "checked" : ""
        }"></span>
        <h3>${phase.title}</h3>
      </div>
      ${tasksHtml}
    `;

    el.onclick = () => {
      location.hash =
        phase.id === "setup"
          ? "#/setup"
          : phase.id === "structure"
            ? "#/structure-base"
            : phase.id === "layout"
              ? "#/layout"
              : phase.id === "branding"
                ? "#/branding"
                : phase.id === "accessibility"
                  ? "#/accessibility"
                  : "#/home";
    };

    container.appendChild(el);
  });
}

/* ============================================================
   PROCESS BUILDER
============================================================ */
window.renderProcessBuilder = function () {
  const list = document.getElementById("pb-process-list");
  if (!list) return;

  list.innerHTML = "";

  store.phases.forEach((phase) => {
    const el = document.createElement("div");
    el.className = `pb-phase pb-${phase.status}`;

    const tasks = store.phaseTasks?.[phase.id] || [];

    if (phase.status === "locked") {
      el.setAttribute(
        "data-tooltip",
        "Conclui a fase anterior para desbloquear",
      );
    }

    const hover = tasks.length
      ? `<div class="pb-phase-hover">
          <ul>
            ${tasks
              .map((t) => `<li class="${t.done ? "done" : ""}">${t.label}</li>`)
              .join("")}
          </ul>
        </div>`
      : "";

    el.innerHTML = `
      <div class="pb-phase-main">
        <span class="pb-phase-status"></span>
        <span class="pb-phase-title">${phase.title}</span>
      </div>
      ${hover}
    `;

    if (phase.status !== "locked") {
      el.onclick = () => {
        location.hash =
          phase.id === "setup"
            ? "#/setup"
            : phase.id === "structure"
              ? "#/structure-base"
              : phase.id === "layout"
                ? "#/layout"
                : phase.id === "branding"
                  ? "#/branding"
                  : phase.id === "accessibility"
                    ? "#/accessibility"
                    : "#/process-builder";
      };
    }

    list.appendChild(el);
  });
};

/* ============================================================
   STRUCTURE BASE (FASE 2)
============================================================ */
window.renderStructureBase = function () {
  const bs = store.baseStructure;
  if (!bs) return;

  const set = (id, v = "") => {
    const el = document.getElementById(id);
    if (el) el.value = v;
  };

  set("arch-type", bs.architecture.type);
  set("arch-approach", bs.architecture.approach);
  set("arch-notes", bs.architecture.notes);

  set("nav-pattern", bs.navigation.pattern);
  set("nav-hierarchy", bs.navigation.hierarchy);
  set("nav-notes", bs.navigation.notes);

  set("foundation-mindset", bs.foundation.mindset);
  set("foundation-constraints", bs.foundation.constraints);
  set("foundation-assumptions", bs.foundation.assumptions);

  renderStructurePages();
  renderStructureActions();
  updateVisibility("structure", structureRules);
};

function renderStructurePages() {
  const list = document.getElementById("pages-list");
  if (!list) return;

  list.innerHTML = "";

  store.baseStructure.pages.forEach((page, index) => {
    const li = document.createElement("li");
    li.className = "structure-page-item";

    const name = document.createElement("span");
    name.textContent = page.name;

    const remove = document.createElement("button");
    remove.textContent = "✕";
    remove.className = "remove-page";
    remove.title = "Remover página";

    remove.onclick = () => {
      store.baseStructure.pages.splice(index, 1);
      store.save();
      renderStructurePages();
      updateVisibility("structure", structureRules);
    };

    li.appendChild(name);
    li.appendChild(remove);
    list.appendChild(li);
  });
}

document.addEventListener("click", (e) => {
  if (e.target.id !== "add-page") return;

  const input = document.getElementById("page-name");
  const name = input.value.trim();
  if (!name) return;

  store.addPageToStructure({ name });
  input.value = "";
  renderStructurePages();
  updateVisibility("structure", structureRules);
});

function renderStructureActions() {
  renderPhaseActions({
    phaseId: "structure",
    isCompleted: store.baseStructure.completed,
    onSave: () => {
      store.updateBaseStructure("architecture", {
        type: document.getElementById("arch-type")?.value || "",
        approach: document.getElementById("arch-approach")?.value || "",
        notes: document.getElementById("arch-notes")?.value || "",
      });

      store.updateBaseStructure("navigation", {
        pattern: document.getElementById("nav-pattern")?.value || "",
        hierarchy: document.getElementById("nav-hierarchy")?.value || "",
        notes: document.getElementById("nav-notes")?.value || "",
      });

      store.updateBaseStructure("foundation", {
        mindset: document.getElementById("foundation-mindset")?.value || "",
        constraints:
          document.getElementById("foundation-constraints")?.value || "",
        assumptions:
          document.getElementById("foundation-assumptions")?.value || "",
      });

      store.checkAutoCompleteStructure();
      updateVisibility("structure", structureRules);
    },
    onContinueRoute: "#/layout",
  });
}

/* ============================================================
   LAYOUT (FASE 3)
============================================================ */
window.renderLayout = function () {
  const layout = store.currentProject.layout;

  // -------- hidratar campos globais --------
  const set = (id, v = "") => {
    const el = document.getElementById(id);
    if (el) el.value = v;
  };
  const check = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!v;
  };

  set("layout-grid-type", layout.grid.type);
  set("layout-max-width", layout.grid.maxWidth);
  set("layout-grid-notes", layout.grid.notes);

  set("layout-primary-focus", layout.hierarchy.primaryFocus);
  set("layout-secondary-focus", layout.hierarchy.secondaryFocus);

  check("layout-header", layout.globalComponents.header);
  check("layout-navigation", layout.globalComponents.navigation);
  check("layout-footer", layout.globalComponents.footer);

  // ✅ UX por página (TUDO acontece aqui)
  renderLayoutPagesUX();

  // ✅ ações globais da fase
  renderLayoutActions();

  // ✅ progressão visual
  updateVisibility("layout", layoutRules);
};

function renderLayoutPagesUX() {
  const pageSelect = document.getElementById("layout-page-select");
  const state = document.getElementById("layout-page-state");
  const applyBtn = document.getElementById("layout-apply");
  const options = document.querySelectorAll(".layout-option");

  if (!pageSelect || !state || !applyBtn) return;

  // --- popular páginas ---
  pageSelect.innerHTML = `<option value="">— selecionar página —</option>`;
  store.baseStructure.pages.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.name;
    opt.textContent = p.name;
    pageSelect.appendChild(opt);
  });

  let currentPage = null;

  // --- mudança de página ---
  pageSelect.onchange = () => {
    currentPage = pageSelect.value;
    applyBtn.disabled = true;

    options.forEach((b) => b.classList.remove("active"));

    if (!currentPage) {
      state.textContent =
        "ℹ️ O layout é definido página a página. Escolhe uma página.";
      return;
    }

    const saved = store.currentProject.layout.pages[currentPage];

    if (saved) {
      state.textContent = `✅ Layout já definido para a página "${currentPage}"`;
      document
        .querySelector(`.layout-option[data-pattern="${saved.pattern}"]`)
        ?.classList.add("active");
    } else {
      state.textContent = `⚠️ Esta página ainda não tem layout definido`;
    }
  };

  // --- escolher layout (não guarda) ---
  options.forEach((btn) => {
    btn.onclick = () => {
      if (!currentPage) return;

      options.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyBtn.disabled = false;
    };
  });

  // --- aplicar layout (guarda mesmo) ---
  applyBtn.onclick = () => {
    const selected = document.querySelector(".layout-option.active");
    if (!currentPage || !selected) return;

    const pattern = selected.dataset.pattern;

    store.currentProject.layout.pages[currentPage] = { pattern };
    store.save();

    state.textContent = `✅ Layout aplicado à página "${currentPage}"`;

    applyBtn.disabled = true;
    updateVisibility("layout", layoutRules);
  };
}

document.addEventListener("click", (e) => {
  if (e.target.id !== "layout-save-page") return;

  const page = document.getElementById("layout-page-select").value;
  const pattern = document.getElementById("layout-page-pattern").value;

  if (!page || !pattern) return;

  store.currentProject.layout.pages[page] = { pattern };

  store.save();
  updateVisibility("layout", layoutRules);
});

function renderLayoutActions() {
  renderPhaseActions({
    phaseId: "layout",
    isCompleted: store.currentProject.layout.completed,
    onSave: () => {
      const layout = store.currentProject.layout;

      layout.grid.type =
        document.getElementById("layout-grid-type")?.value || "";
      layout.grid.maxWidth =
        document.getElementById("layout-max-width")?.value || "";
      layout.grid.notes =
        document.getElementById("layout-grid-notes")?.value || "";

      layout.globalComponents.header =
        document.getElementById("layout-header")?.checked || false;
      layout.globalComponents.navigation =
        document.getElementById("layout-navigation")?.checked || false;
      layout.globalComponents.footer =
        document.getElementById("layout-footer")?.checked || false;

      layout.hierarchy.primaryFocus =
        document.getElementById("layout-primary-focus")?.value || "";
      layout.hierarchy.secondaryFocus =
        document.getElementById("layout-secondary-focus")?.value || "";

      store.checkAutoCompleteLayout();
      store.save();
      updateVisibility("layout", layoutRules);
    },
    onContinueRoute: "#/branding",
  });
}

/* ============================================================
   BRANDING (FASE 4) — VERSÃO FINAL ESTÁVEL
============================================================ */
let brandingPreviewOpen = false;

window.renderBranding = function () {
  const branding = store.currentProject.branding;
  if (!branding) return;

  renderBrandingUX();
  applyBrandingToPreview();
  renderBrandingActions();
  updateVisibility("branding", brandingRules);
};

/* == UX PRINCIPAL == */
function renderBrandingUX() {
  const branding = store.currentProject.branding;
  const state = document.getElementById("branding-state");

  /* ---------- TOM ---------- */
  document.querySelectorAll(".branding-tone").forEach((radio) => {
    radio.checked = radio.value === branding.tone;

    radio.onchange = () => {
      branding.tone = radio.value;
      store.save();
      store.checkAutoCompleteBranding();
      applyBrandingToPreview();

      if (state) {
        state.textContent = `✅ Tom definido: "${radio.value}"`;
      }
    };
  });

  /* ---------- CORES (IMEDIATO) ---------- */
  const primaryInput = document.getElementById("branding-primary-color");
  const secondaryInput = document.getElementById("branding-secondary-color");

  if (primaryInput && secondaryInput) {
    primaryInput.value = branding.colors.primary || "#222222";
    secondaryInput.value = branding.colors.secondary || "#999999";

    const applyColors = () => {
      branding.colors.primary = primaryInput.value;
      branding.colors.secondary = secondaryInput.value;
      store.save();
      store.checkAutoCompleteBranding();
      applyBrandingToPreview();
    };

    primaryInput.oninput = applyColors;
    secondaryInput.oninput = applyColors;
  }

  /* ---------- TIPOGRAFIA ---------- */
  document.querySelectorAll(".branding-type-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === branding.typography);

    btn.onclick = () => {
      branding.typography = btn.dataset.type;
      store.save();
      store.checkAutoCompleteBranding();
      applyBrandingToPreview();
    };
  });

  /* ---------- MODO VISUAL ---------- */
  document
    .querySelectorAll('input[name="branding-visual-mode"]')
    .forEach((radio) => {
      radio.checked = radio.value === branding.visualMode;

      radio.onchange = () => {
        branding.visualMode = radio.value;
        store.save();
        store.checkAutoCompleteBranding();
        applyBrandingToPreview();
      };
    });

  /* ---------- WCAG (INTENÇÃO) ---------- */
  document.querySelectorAll('input[name="branding-wcag"]').forEach((radio) => {
    radio.checked = radio.value === branding.wcagTarget;

    radio.onchange = () => {
      branding.wcagTarget = radio.value;
      store.save();
      store.checkAutoCompleteBranding();
    };
  });

  /* ---------- FULLSCREEN BUTTON ---------- */
  const previewBtn = document.getElementById("preview-expand");

  if (previewBtn) {
    previewBtn.textContent = brandingPreviewOpen
      ? "VOLTAR"
      : "VER ECRÃ INTEIRO";

    previewBtn.onclick = () => {
      brandingPreviewOpen ? closeBrandingPreview() : openBrandingPreview();
    };
  }

  /* ---------- ESC ---------- */
  document.onkeydown = (e) => {
    if (e.key === "Escape" && brandingPreviewOpen) {
      closeBrandingPreview();
    }
  };
}

/* == PREVIEW APLICA BRANDING == */
function applyBrandingToPreview() {
  const branding = store.currentProject.branding;
  const preview = document.getElementById("branding-preview-canvas");
  if (!preview) return;

  /* cores */
  preview.style.setProperty("--primary", branding.colors.primary || "#222");
  preview.style.setProperty("--secondary", branding.colors.secondary || "#999");

  /* tipografia */
  preview.classList.remove("type-neutral", "type-modern", "type-editorial");
  if (branding.typography) {
    preview.classList.add(`type-${branding.typography}`);
  }

  /* modo */
  preview.classList.remove("mode-light", "mode-dark");
  preview.classList.add(
    branding.visualMode === "dark" ? "mode-dark" : "mode-light",
  );
}

/* == FULLSCREEN CONTROLS == */
function openBrandingPreview() {
  const preview = document.getElementById("branding-preview");
  const btn = document.getElementById("preview-expand");
  if (!preview || !btn) return;

  brandingPreviewOpen = true;
  preview.classList.add("is-fullscreen");
  document.body.classList.add("preview-open");

  btn.textContent = "VOLTAR";
}

function closeBrandingPreview() {
  const preview = document.getElementById("branding-preview");
  const btn = document.getElementById("preview-expand");
  if (!preview || !btn) return;

  brandingPreviewOpen = false;
  preview.classList.remove("is-fullscreen");
  document.body.classList.remove("preview-open");

  btn.textContent = "VER ECRÃ INTEIRO";
}

/* == AÇÕES DA FASE == */
function renderBrandingActions() {
  renderPhaseActions({
    phaseId: "branding",
    isCompleted: store.currentProject.branding.completed,

    onSave: () => {
      store.checkAutoCompleteBranding();
      store.save();

      if (!store.currentProject.branding.completed) {
        alert("⚠️ Completa todas as tarefas de Branding antes de avançar.");
      }
    },

    onContinueRoute: "#/accessibility",
  });
}

/* ============================================================
   GENERIC PHASE FOOTER ACTIONS
============================================================ */
function renderPhaseActions({ phaseId, isCompleted, onSave, onContinueRoute }) {
  const footer = document.querySelector(".phase-actions");
  if (!footer) return;

  footer.innerHTML = "";

  const primary = document.createElement("button");
  const secondary = document.createElement("button");

  secondary.textContent = "← Voltar ao Process Builder";
  secondary.onclick = () => (location.hash = "#/process-builder");

  if (!isCompleted) {
    primary.textContent = "Guardar e continuar";
    primary.onclick = () => {
      onSave();
      const phase = store.currentProject.process.phases.find(
        (p) => p.id === phaseId,
      );
      if (phase?.status === "completed") location.hash = onContinueRoute;
    };
  } else {
    primary.textContent = "Guardar alterações";
    primary.onclick = () => {
      onSave();
      alert("Alterações guardadas ✅");
    };
  }

  footer.append(primary, secondary);
}
