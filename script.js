// Mostrar y cerrar modales
function mostrarLogin() {
  document.getElementById('modal-login').style.display = 'block';
}
function mostrarRegistro() {
  document.getElementById('modal-registro').style.display = 'block';
}
function cerrarModal() {
  document.getElementById('modal-login').style.display = 'none';
  document.getElementById('modal-registro').style.display = 'none';
}

// Guardar usuario nuevo
function registrarUsuario() {
  const nombre = document.querySelector('#modal-registro input[type="text"]').value;
  const correo = document.querySelector('#modal-registro input[type="email"]').value;
  const pass = document.querySelector('#modal-registro input[type="password"]').value;

  if (!nombre || !correo || !pass) {
    alert("⚠️ Por favor completa todos los campos.");
    return;
  }

  // Guardar usuario en localStorage
  const usuario = { nombre, correo };
  localStorage.setItem("usuarioPymax", JSON.stringify(usuario));

  cerrarModal();
  actualizarUsuario();
  alert(`✅ Bienvenido a Pymax, ${nombre}!`);
}

// Mostrar nombre si ya está logueado
function actualizarUsuario() {
  const nav = document.querySelector('nav');
  const usuario = JSON.parse(localStorage.getItem("usuarioPymax"));

  if (usuario) {
    nav.innerHTML = `
      <span>👋 Hola, ${usuario.nombre}</span>
      <button onclick="cerrarSesion()">Cerrar sesión</button>
    `;
  }
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem("usuarioPymax");
  location.reload();
}

// Prueba gratuita
function enviarPrueba() {
  document.getElementById('mensaje').innerText =
    "✅ Datos enviados correctamente. Los resultados están listos — desbloquéalos adquiriendo el servicio premium 🔒";
}

// Pago simulado
function pagarPremium() {
  alert("💳 Simulando pago con Stripe (modo demo)... Redirigiendo al panel Premium");
  window.location.href = 'premium.html';
}

// Iniciar sesión (simulado)
function login() {
  const email = document.querySelector('#modal-login input[type="email"]').value;
  const pass = document.querySelector('#modal-login input[type="password"]').value;

  if (!email || !pass) {
    alert("Por favor completa tus datos");
    return;
  }

  const usuario = { nombre: email.split('@')[0], correo: email };
  localStorage.setItem("usuarioPymax", JSON.stringify(usuario));
  cerrarModal();
  actualizarUsuario();
  alert(`👋 Bienvenido de nuevo, ${usuario.nombre}!`);
}

// Ejecutar cuando carga la página
window.onload = actualizarUsuario;