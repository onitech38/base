import store from "./store.js";
import { renderLogin, renderSignup } from "./auth.js";

const app = document.getElementById("app");

/* =====================
   RENDER LOGIN
===================== */
export function renderLogin() {
  app.innerHTML = `
    <section class="page page-login">
      <h1>Log in</h1>

      <form id="login-form">
        <label>
          Primeiro nome
          <input type="text" id="login-firstname" required />
        </label>

        <label>
          Password
          <input type="password" id="login-password" required />
        </label>

        <button type="submit">Entrar</button>
      </form>

      <p>
        Ainda não tens conta?
        <button id="go-signup" type="button">Criar conta</button>
      </p>
    </section>
  `;

  bindLoginEvents();
}

/* =====================
   RENDER SIGNUP
===================== */
export function renderSignup() {
  app.innerHTML = `
    <section class="page page-signup">
      <h1>Sign up</h1>

      <form id="signup-form">
        <label>
          Primeiro nome
          <input type="text" id="signup-firstname" required />
        </label>

        <label>
          Último nome
          <input type="text" id="signup-lastname" required />
        </label>

        <label>
          Password
          <input type="password" id="signup-password" required />
        </label>

        <label>
          Confirmar password
          <input type="password" id="signup-password-confirm" required />
        </label>

        <button type="submit">Criar conta</button>
      </form>

      <p>
        Já tens conta?
        <button id="go-login" type="button">Fazer login</button>
      </p>
    </section>
  `;

  bindSignupEvents();
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

    location.hash = "#/project-select";
  });

  document.getElementById("go-signup").onclick = () => {
    renderSignup();
  };
}

function bindSignupEvents() {
  document.getElementById("signup-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const firstName = document.getElementById("signup-firstname").value.trim();
    const lastName = document.getElementById("signup-lastname").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-password-confirm").value;

    if (!firstName || !lastName) {
      alert("Preenche nome e apelido.");
      return;
    }

    if (password.length < 6) {
      alert("Password deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      alert("As passwords não coincidem.");
      return;
    }

    store.signUp({ firstName, lastName, password });
    location.hash = "#/project-select";
  });

  document.getElementById("go-login").onclick = () => {
    renderLogin();
  };
}
