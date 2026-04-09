import store from "./store.js";

const app = document.getElementById("app");

/* =====================
   NAV CLICK
===================== */
document.querySelectorAll("nav button").forEach((btn) => {
  btn.onclick = () => {
    location.hash = `#/${btn.dataset.page}`;
  };
});

/* =====================
   ROUTER
===================== */
async function loadPage() {
  let page = location.hash.replace("#/", "");
  if (!page) page = "home";

  // Forçar setup apenas antes do onboarding
  if (!store.state.progress.onboardingCompleted && page !== "setup") {
    location.hash = "#/setup";
    return;
  }

  const res = await fetch(`pages/${page}.html`);
  app.innerHTML = await res.text();

  if (page === "process-builder") {
    window.processBuilder.loadProcesses();
  }

  if (page === "home") {
    if (
      store.processes.length === 0 &&
      store.state.progress.onboardingCompleted
    ) {
      store.generateProcessesFromProject();
    }
    window.renderHomeDashboard();
  }
}

window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
