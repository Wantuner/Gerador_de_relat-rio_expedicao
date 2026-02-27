const form = document.getElementById("loginForm");
const usuario = document.getElementById("usuario");
const senha = document.getElementById("senha");
const toast = document.getElementById("toast");
const LOGIN_DOMAIN = "empresa.local";

function mostrarToast(msg, tipo) {
  toast.textContent = msg;
  toast.className = "";
  toast.classList.add("show", tipo);
  setTimeout(() => toast.classList.remove("show"), 3000);
}

async function redirecionarSeAutenticado() {
  const { data, error } = await window.supabaseClient.auth.getSession();
  if (!error && data.session) {
    window.location.href = "index.html";
  }
}

function normalizarLogin(valor) {
  const login = valor.trim().toLowerCase();
  if (!login) return "";
  return login.includes("@") ? login : `${login}@${LOGIN_DOMAIN}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const emailConvertido = normalizarLogin(usuario.value);

  if (!emailConvertido) {
    mostrarToast("Informe usuario e senha.", "aviso");
    return;
  }

  const { error } = await window.supabaseClient.auth.signInWithPassword({
    email: emailConvertido,
    password: senha.value
  });

  if (error) {
    mostrarToast("Falha no login. Verifique usuario/e-mail e senha.", "erro");
    return;
  }

  mostrarToast("Login realizado com sucesso", "sucesso");
  window.location.href = "index.html";
});

redirecionarSeAutenticado();
