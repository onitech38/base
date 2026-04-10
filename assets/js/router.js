import store from "./store.js";

const app = document.getElementById("app");

/* =====================
   NAV
===================== */
document.querySelectorAll("nav button").forEach(btn => {
  btn.onclick = () => {
    const page = btn.dataset.page;
    if (!page) return;

    if (page === "logout") {
      localStorage.removeItem("process-builder");
      location.reload();
      return;
    }

    location.hash = `#/${page}`;
  };
});

/* =====================
   ROUTER
===================== */
async function loadPage() {
  let page = location.hash.replace("#/", "");
  if (!page) page = "home";

  // Forçar setup
  if (!store.state.progress.onboardingCompleted && page !== "setup") {
    location.hash = "#/setup";
    return;
  }

  const res = await fetch(`pages/${page}.html`);
  app.innerHTML = await res.text();

  // HOME
  if (page === "home" && window.renderHomeDashboard) {
    window.renderHomeDashboard();
  }

  // PROCESS BUILDER — ESPERAR ATÉ EXISTIR
  if (page === "process-builder") {
    waitForProcessBuilder();
  }
}

/* =====================
   GUARDA ROBUSTA
===================== */
function waitForProcessBuilder() {
  if (window.processBuilder && typeof window.processBuilder.loadProcesses === "function") {
    window.processBuilder.loadProcesses();
  } else {
    // tenta novamente no próximo frame
    requestAnimationFrame(waitForProcessBuilder);
  }
}

window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
