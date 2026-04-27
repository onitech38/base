import store from "./store.js";
import { renderLogin, renderSignup } from "./auth.js";

const app = document.getElementById("app");

window.pendingPhaseToOpen = null;

/* =====================
   ROUTER
===================== */
async function loadPage() {
  let route = location.hash.replace("#/", "");
  if (!route) route = "welcome";

  const { auth } = store.state;

  /* =========================================
     GUEST
  ========================================= */
  if (auth.status === "guest") {
    if (["login", "signup"].includes(route)) {
      return render(route);
    }
    return render("welcome");
  }

  /* =========================================
     POST-LOGIN (DECISÃO CENTRAL)
  ========================================= */
  if (route === "post-login") {
    // segurança
    if (auth.status !== "authenticated") {
      location.hash = "#/welcome";
      return;
    }

    const user = store.currentUser;
    if (!user) {
      location.hash = "#/welcome";
      return;
    }

    // 👉 verificar se existe ALGUM projeto com setup completo
    const hasCompletedProject = user.projectIds.some((id) => {
      const project = store.state.projects[id];
      return project?.setupCompleted === true;
    });

    if (hasCompletedProject) {
      location.hash = "#/login-plus";
      return;
    }

    // nunca completou setup
    location.hash = "#/setup";
    return;
  }

  /* =========================================
     DEFAULT AUTHENTICATED
  ========================================= */
  return render(route);
}

/* =====================
   RENDER
===================== */
async function render(route) {
  // fallback
  route = route || "welcome";

  /* =====================
     ROUTE GUARDS (ANTES DO FETCH)
  ===================== */

  // HOME
  if (route === "home") {
    if (store.state.auth.status !== "authenticated") {
      location.hash = "#/welcome";
      return;
    }

    if (!store.currentProject) {
      location.hash = "#/login-plus";
      return;
    }

    if (!store.currentProject.setupCompleted) {
      location.hash = "#/setup";
      return;
    }
  }

  // LOGIN & SIGNUP

  // LOGIN+
  if (route === "login-plus") {
    if (store.state.auth.status !== "authenticated") {
      location.hash = "#/welcome";
      return;
    }
  }

  /* =====================
     FETCH HTML (SÓ AGORA)
  ===================== */

  const res = await fetch(`pages/${route}.html`);
  if (!res.ok) {
    app.innerHTML = "<p>Página não encontrada</p>";
    return;
  }

  app.innerHTML = await res.text();

  /* =====================
     CALL PAGE LOGIC
  ===================== */
  if (route === "login") {
    window.renderLogin && window.renderLogin();
    return;
  }

  if (route === "signup") {
    window.renderSignup && window.renderSignup();
    return;
  }

  if (route === "setup") {
    window.renderSetup && window.renderSetup();
    return;
  }

  if (route === "home") {
    window.renderHome && window.renderHome();
    return;
  }

  if (route === "login-plus") {
    window.renderLoginPlus && window.renderLoginPlus();
    return;
  }

  if (route === "process-builder") {
    window.renderProcessBuilder && window.renderProcessBuilder();
  }

  if (route === "structure-base") {
    window.renderStructureBase && window.renderStructureBase();
  }

  if (route === "layout") {
    window.renderLayout && window.renderLayout();
  }

  if (route === "branding") {
    window.renderBranding && window.renderBranding();
  }

  if (route === "accessibility") {
    window.renderAccessibility && window.renderAccessibility();
  }
}

// ✅ GARANTIR NAV ATUALIZADO COM ESTADO REAL
window.updateNav && window.updateNav();
window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
