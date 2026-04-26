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

    location.hash = "#/login-plus";
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

/* =====================
   EVENTS
===================== */
function bindLoginEvents() {
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const firstName = document.getElementById("login-firstname").value.trim();
    const password = document.getElementById("login-password").value;

    const success = store.login({ firstName, password });

    if (!success) {
      alert("Credenciais inválidas.");
      return;
    }

    // ✅ APÓS LOGIN → LOGIN+
    location.hash = "#/login-plus";
  });

  document.getElementById("go-signup").onclick = () => {
    location.hash = "#/signup";
  };
}

function bindSignupEvents() {
  document.getElementById("signup-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const firstName = document.getElementById("signup-firstname").value.trim();
    const lastName = document.getElementById("signup-lastname").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-password-confirm").value;

    if (password.length < 6) {
      alert("Password deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      alert("As passwords não coincidem.");
      return;
    }

    store.signUp({ firstName, lastName, password });

    // ✅ APÓS SIGNUP → SETUP
    location.hash = "#/setup";
  });

  document.getElementById("go-login").onclick = () => {
    location.hash = "#/login";
  };
}
