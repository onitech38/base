import { store } from "./store.js";

const app = document.getElementById("app");

function updateActiveNav(page) {
  document.querySelectorAll("nav button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });
}

async function loadPage() {
  let page = location.hash.replace("#", "").replace("/", "");

  // ✅ FORÇAR SETUP ANTES DE QUALQUER OUTRA PÁGINA
  if (!store.isSetupComplete()) {
    if (page !== "setup") {
      location.hash = "#/setup";
      return;
    }
  }

  // Depois do setup, default é home
  if (!page) {
    page = "home";
  }

  updateActiveNav(page);
  app.classList.add("is-leaving");

  const res = await fetch(`pages/${page}.html`);
  const html = await res.text();

  setTimeout(() => {
    app.innerHTML = html;

    requestAnimationFrame(() => {
      app.classList.remove("is-leaving");

      if (page === "process-builder") {
        if (store.processes.length === 0) {
          store.generateProcessesFromProject();
        }
        window.processBuilder.loadProcesses();
      }
    });
  }, 150);
}

document.querySelectorAll("nav button").forEach((btn) => {
  btn.addEventListener("click", () => {
    location.hash = btn.dataset.page;
  });
});

window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
