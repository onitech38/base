import store from "./store.js";

const app = document.getElementById("app");

document.querySelectorAll("nav button").forEach(btn => {
  btn.onclick = () => location.hash = `#/${btn.dataset.page}`;
});

async function loadPage() {
  let page = location.hash.replace("#/", "");
  if (!page) page = "home";

  if (!store.state.progress.onboardingCompleted && page !== "setup") {
    location.hash = "#/setup";
    return;
  }

  const res = await fetch(`pages/${page}.html`);
  app.innerHTML = await res.text();

  if (page === "home") window.renderHomeDashboard();
}

window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
