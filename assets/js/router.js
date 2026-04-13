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
    if (route === "login") {
      renderLogin();
      return;
    }

    if (route === "signup") {
      renderSignup();
      return;
    }

    return render("welcome");
  }

  /* ---------- AUTHENTICATED, NO PROJECT ---------- */
  if (!store.currentProject) {
    return render("project-select");
  }

  /* ---------- AUTHENTICATED WITH PROJECT ---------- */
  return render(route);
}

/* =====================
   RENDER
===================== */
async function render(route) {
  const res = await fetch(`pages/${route}.html`);
  app.innerHTML = await res.text();

  if (route === "setup") {
    window.renderSetup && window.renderSetup();
  }

  if (route === "home") {
    if (window.renderHome && store.currentProject) {
      window.renderHome();
    }
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
}

// ✅ GARANTIR NAV ATUALIZADO COM ESTADO REAL
window.updateNav && window.updateNav();
window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
