import { store } from "./store.js";

const app = document.getElementById("app");

/* -------------------------------
   Atualizar botão ativo no menu
------------------------------- */
function updateActiveNav(page) {
  document.querySelectorAll("nav button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });
}

/* -------------------------------
   Router SPA (VERSÃO FINAL)
------------------------------- */
async function loadPage() {
  let page = location.hash.replace("#", "").replace("/", "");

  // ✅ REGRA FINAL:
  // Forçar Setup APENAS enquanto onboarding não terminou
  if (!store.state.progress.onboardingCompleted) {
    if (page !== "setup") {
      location.hash = "#/setup";
      return;
    }
  }

  // Default depois do onboarding
  if (!page) {
    page = "home";
  }

  updateActiveNav(page);
  app.classList.add("is-leaving");

  try {
    const res = await fetch(`pages/${page}.html`);
    const html = await res.text();

    setTimeout(() => {
      app.innerHTML = html;

      requestAnimationFrame(() => {
        app.classList.remove("is-leaving");

        // Bootstrap do Process Builder
        if (page === "process-builder" && window.processBuilder) {
          window.processBuilder.loadProcesses();
        }
      });
    }, 150);
  } catch (err) {
    app.innerHTML = "<h2>Erro ao carregar página.</h2>";
    app.classList.remove("is-leaving");
  }
}

/* -------------------------------
   Navegação via menu
------------------------------- */
document.querySelectorAll("nav button").forEach((btn) => {
  btn.addEventListener("click", () => {
    location.hash = btn.dataset.page;
  });
});

/* -------------------------------
   Eventos globais
------------------------------- */
window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
