import store from "./store.js";

const app = document.getElementById("app");

/* =====================
   LOGIN
===================== */
export function renderLogin() {
  const form = document.querySelector(".page-login .auth-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.querySelector("input[type='text']").value.trim();
    const password = form.querySelector("input[type='password']").value;

    const success = store.login({ firstName: name, password });

    if (!success) {
      alert("Credenciais inválidas.");
      return;
    }

    location.hash = "#/post-login";
  });
}

/* =====================
   SIGNUP
===================== */
export function renderSignup() {
  const form = document.querySelector(".page-signup .auth-form");
  if (!form) return;

  const inputs = form.querySelectorAll("input");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const firstName = inputs[0].value.trim();
    const lastName = inputs[1].value.trim();
    const password = inputs[2].value;
    const confirm = inputs[3].value;

    if (password.length < 6) {
      alert("Password deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      alert("As passwords não coincidem.");
      return;
    }

    store.signUp({ firstName, lastName, password });
    location.hash = "#/setup";
  });
}

window.renderLogin = renderLogin;
window.renderSignup = renderSignup;
