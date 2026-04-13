import store from "./store.js";

const app = document.getElementById("app");

/* =====================
   RENDER LOGIN
===================== */
export function renderLogin() {
  app.innerHTML = `
    <h2>Log in</h2>

    <form id="login-form">
      <label>
        Primeiro nome
        <input id="login-firstname" required />
      </label>

      <label>
        Password
        <input id="login-password" type="password" required />
      </label>

      <button type="submit">Entrar</button>
    </form>

    <p>
      Ainda não tens conta?
      <button id="go-signup">Criar conta</button>
    </p>
  `;

  bindLoginEvents();
}

/* =====================
   RENDER SIGNUP
===================== */
export function renderSignup() {
  app.innerHTML = `
    <h2>Sign up</h2>

    <form id="signup-form">
      <label>
        Primeiro nome
        <input id="signup-firstname" required />
      </label>

      <label>
        Último nome
        <input id="signup-lastname" required />
      </label>

      <label>
        Password
        <input id="signup-password" type="password" required />
      </label>

      <label>
        Confirmar password
        <input id="signup-password-confirm" type="password" required />
      </label>

      <button type="submit">Criar conta</button>
    </form>

    <p>
      Já tens conta?
      <button id="go-login">Fazer login</button>
    </p>
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

    // ✅ DECISÃO DE FLUXO APÓS LOGIN
    const user = store.currentUser;

    if (user.projectIds.length === 0) {
      // nunca criou projeto
      location.hash = "#/project-select";
    } else if (user.projectIds.length === 1) {
      // tem apenas um projeto → continuar
      store.selectProject(user.projectIds[0]);

      const project = store.currentProject;
      location.hash = project.setupCompleted ? "#/process-builder" : "#/setup";
    } else {
      // mais que um projeto → escolher
      // 🔴 FORÇAR O ROUTER A REAGIR AO NOVO ESTADO
      location.hash = "#/project-select";
    }
    window.dispatchEvent(new HashChangeEvent("hashchange"));
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

    // 🔴 FORÇAR O ROUTER A REAGIR AO NOVO ESTADO
    location.hash = "#/project-select";
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    // ✅ SAÍDA IMEDIATA DO ESTADO GUEST
    location.hash = "#/project-select";
  });

  document.getElementById("go-login").onclick = () => {
    location.hash = "#/login";
  };
}
