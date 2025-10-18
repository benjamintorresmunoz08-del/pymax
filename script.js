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

// Guardar usuario nuevo (versión conectada al backend)
// Guardar usuario nuevo (versión optimizada con aviso inmediato)
async function registrarUsuario() {
  const nombre = document.querySelector('#modal-registro input[type="text"]').value.trim();
  const correo = document.querySelector('#modal-registro input[type="email"]').value.trim();
  const pass = document.querySelector('#modal-registro input[type="password"]').value.trim();

  if (!nombre || !correo || !pass) {
    alert("Por favor completa todos los campos.");
    return;
  }

  // 🔔 Mostrar mensaje inmediato sin esperar respuesta
  alert("Estamos enviando tu correo de confirmación. Esto puede tardar unos segundos...");

  try {
    const respuesta = await fetch("https://pymax-backend-6d37.onrender.com/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nombre, email: correo, password: pass })
    });

    const data = await respuesta.json();

    if (respuesta.ok) {
      cerrarModal();
      alert("✅ Registro exitoso. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.");
    } else {
      alert("⚠️ Error: " + (data.error || "No se pudo registrar el usuario."));
    }
  } catch (err) {
    alert("❌ Error de conexión con el servidor. Intenta más tarde.");
    console.error(err);
  }
}


// Mostrar nombre si ya está logueado
function actualizarUsuario() {
  const nav = document.querySelector('nav');
  const usuario = JSON.parse(localStorage.getItem("usuarioPymax"));

  if (usuario) {
    nav.innerHTML = `
      <span> Hola, ${usuario.nombre}</span>
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
    " Datos enviados correctamente. Los resultados están listos — desbloquéalos adquiriendo el servicio premium 🔒";
}

// Pago simulado
function pagarPremium() {
  alert(" Simulando pago con Stripe (modo demo)... Redirigiendo al panel Premium");
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
  alert(` Bienvenido de nuevo, ${usuario.nombre}!`);
}

// Ejecutar cuando carga la página
window.onload = actualizarUsuario;