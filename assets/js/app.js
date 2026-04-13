/* ============================================================
   BOOT / GLOBAL STATE
============================================================ */
import store from "./store.js";
window.store = store;
window.pendingPhaseToOpen = null;

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
  const navProcess = document.getElementById("nav-process");
  const navLogout = document.getElementById("nav-logout");
  if (!navHome || !navProcess || !navLogout) return;

  const isAuth = store.state.auth.status === "authenticated";
  const hasProject = !!project;

  navHome.style.display = isAuth && hasProject ? "inline-block" : "none";
  navProcess.style.display = hasProject ? "inline-block" : "none";
  navLogout.style.display = isAuth ? "inline-block" : "none";

  if (user) navHome.textContent = `${user.firstName} ${user.lastName}`;

  navHome.onclick = () => (location.hash = "#/home");
  navProcess.onclick = () => (location.hash = "#/process-builder");
  navLogout.onclick = () => {
    store.logout();
    location.hash = "#/welcome";
  };
}

window.updateNav = updateNav;
window.addEventListener("store-updated", updateNav);

/* ============================================================
   HOME
============================================================ */
window.renderHome = function () {
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

    if (phase.status !== "locked") {
      el.onclick = () => {
        location.hash =
          phase.id === "setup"
            ? "#/setup"
            : phase.id === "structure"
              ? "#/structure-base"
              : phase.id === "layout"
                ? "#/layout"
                : "#/home";
      };
    }

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
   BRANDING (FASE 4)
============================================================ */
window.renderBranding = function () {
  const branding = store.currentProject.branding;
  if (!branding) return;

  // helper local
  const set = (id, v = "") => {
    const el = document.getElementById(id);
    if (el) el.value = v;
  };

  // hidratar campos existentes
  set("branding-primary-color", branding.colors.primary);
  set("branding-secondary-color", branding.colors.secondary);

  renderBrandingUX();
  renderBrandingActions();
  updateVisibility("branding", brandingRules);
};

function renderBrandingUX() {
  const state = document.getElementById("branding-state");
  const applyBtn = document.getElementById("branding-apply");
  const toneRadios = document.querySelectorAll(".branding-tone");

  if (!state || !applyBtn || !toneRadios.length) return;

  applyBtn.disabled = true;

  /* --- estado inicial --- */
  if (!store.currentProject.branding.tone) {
    state.textContent = "ℹ️ Começa por definir o tom base do projeto.";
  } else {
    state.textContent = `✅ Tom definido: "${store.currentProject.branding.tone}"`;

    const radio = document.querySelector(
      `.branding-tone[value="${store.currentProject.branding.tone}"]`,
    );

    if (radio) {
      radio.checked = true;
    }
  }

  /* --- mudar tom (não guarda) --- */
  toneRadios.forEach((radio) => {
    radio.onchange = () => {
      applyBtn.disabled = false;
    };
  });

  /* --- aplicar tom (guarda mesmo) --- */
  applyBtn.onclick = () => {
    const selected = document.querySelector(".branding-tone:checked");
    if (!selected) return;

    store.currentProject.branding.tone = selected.value;
    store.save();

    state.textContent = `✅ Tom "${selected.value}" aplicado ao projeto`;
    applyBtn.disabled = true;

    updateVisibility("branding", brandingRules);
  };
}

function renderBrandingActions() {
  renderPhaseActions({
    phaseId: "branding",
    isCompleted: store.currentProject.branding.completed,
    onSave: () => {
      store.checkAutoCompleteBranding();
      store.save();
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
