import store from "./store.js";
import { renderLogin, renderSignup } from "./auth.js";

const app = document.getElementById("app");

/* =====================
   ROUTES CONFIG
===================== */
const PUBLIC_ROUTES = ["welcome", "login", "signup"];
const AUTH_NO_PROJECT_ROUTES = ["project-select"];
const AUTH_PROJECT_ROUTES = ["setup", " home", "process-builder"];

/* =====================
   ROUTER CORE
===================== */
async function loadPage() {
  let route = location.hash.replace("#/", "");
  if (!route) route = "welcome";

  const { auth } = store.state;
  const project = store.currentProject;

  /* ---------- STATE A: GUEST ---------- */
  if (auth.status === "guest") {
    if (!PUBLIC_ROUTES.includes(route)) {
      return redirect("welcome");
    }

    // 🔐 AUTH via JS (sem fetch)
    if (route === "login") {
      renderLogin();
      return;
    }

    if (route === "signup") {
      renderSignup();
      return;
    }

    return render(route);
  }

  /* ---------- STATE B: AUTH, NO PROJECT ---------- */
  if (auth.status === "authenticated" && !auth.activeProjectId) {
    if (!AUTH_NO_PROJECT_ROUTES.includes(route)) {
      return redirect("project-select");
    }

    return render(route);
  }

  /* ---------- STATE C: AUTH WITH PROJECT ---------- */
  if (auth.status === "authenticated" && project) {
    // setup é sempre obrigatório
    if (!project.setupCompleted && route !== "setup") {
      return redirect("setup");
    }

    // setup já feito → não volta
    if (project.setupCompleted && route === "setup") {
      return redirect("home");
    }

    if (!AUTH_PROJECT_ROUTES.includes(route)) {
      return redirect("home");
    }

    return render(route);
  }

  // fallback seguro
  redirect("welcome");
}

/* =====================
   RENDER (HTML PAGES)
===================== */
async function render(route) {
  const res = await fetch(`pages/${route}.html`);
  app.innerHTML = await res.text();

  // hooks por página
  if (route === "home" && window.renderHomeDashboard) {
    window.renderHomeDashboard();
  }

  if (route === "process-builder" && window.processBuilder) {
    window.processBuilder.loadPhases?.();
  }
}

/* =====================
   UTILS
===================== */
function redirect(route) {
  location.hash = `#/${route}`;
}

/* =====================
   LISTENERS
===================== */
window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
