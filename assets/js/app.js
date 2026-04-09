import { store } from "./store.js";

/* =====================================================
   PROGRESS UI (GLOBAL – HEADER / DASH)
===================================================== */
function updateProgressUI() {
  const value = store.state.progress.global;

  const valueEl = document.getElementById("progress-value");
  const fillEl = document.getElementById("progress-fill");

  if (valueEl) valueEl.textContent = `${value}%`;
  if (fillEl) fillEl.style.width = `${value}%`;
}

window.addEventListener("store-updated", updateProgressUI);
document.addEventListener("DOMContentLoaded", updateProgressUI);

/* =====================================================
   SETUP (ONBOARDING)
===================================================== */
document.addEventListener("click", (e) => {
  if (e.target.id !== "setup-submit") return;

  const project = {
    name: document.getElementById("setup-name")?.value.trim(),
    type: document.getElementById("setup-type")?.value,
    goal: document.getElementById("setup-goal")?.value,
    features: {
      login: document.getElementById("feature-login")?.checked || false,
      backend: document.getElementById("feature-backend")?.checked || false,
