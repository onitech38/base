import store from "./store.js";

const app = document.getElementById("app");

async function loadPage() {
  let page = location.hash.replace("#", "").replace("/", "");
  if (!page) page = "home";

  if (!store.state.progress.onboardingCompleted && page !== "setup") {
    location.hash = "#/setup";
    return;
  }

  const res = await fetch(`pages/${page}.html`);
  app.innerHTML = await res.text();

  if (page === "home") window.renderHomeDashboard();
  if (page === "process-builder") window.processBuilder.loadProcesses();
}

window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
