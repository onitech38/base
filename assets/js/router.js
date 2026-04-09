import store from "./store.js";

const app = document.getElementById("app");

// Navegação
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

async function loadPage() {
  let page = location.hash.replace("#/", "");

  if (!page) page = "home";

  // Forçar setup antes de tudo
  if (!store.state.progress.onboardingCompleted && page !== "setup") {
    location.hash = "#/setup";
    return;
  }

  const res = await fetch(`pages/${page}.html`);
  app.innerHTML = await res.text();

  // Home
  if (page === "home" && window.renderHomeDashboard) {
    window.renderHomeDashboard();
  }

  // Process Builder
  if (page === "process-builder" && window.processBuilder) {
    window.processBuilder.loadProcesses();
  }
}

window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
