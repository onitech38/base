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

  /* ---------- GUEST ---------- */
  if (auth.status === "guest") {
    if (["login", "signup", "login-plus"].includes(route)) {
      return render(route);
    }
    return render("welcome");
  }

  // exemplo de guard correto
  if (route === "home" && !store.currentProject) {
    location.hash = "#/login+";
    return;
  }

  /* ---------- AUTHENTICATED WITH PROJECT ---------- */
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
  if (route === "login") {
    window.renderLogin && window.renderLogin();
  }

  if (route === "signup") {
    window.renderSignup && window.renderSignup();
  }

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
