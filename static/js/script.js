// ===== Config =====
const BACKEND_URL = 'https://pymax-backend-6d37.onrender.com';

// Clave de sesión y duración (24 horas)
const SESSION_KEY = 'usuarioPymax';
const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000;

// ===== Funciones de sesión (nueva capa) =====
function guardarSesion(usuario) {
  const sesion = {
    ...usuario,
    createdAt: Date.now()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
}

function cargarSesion() {
  let ses = null;
  try {
    ses = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    ses = null;
  }

  if (!ses) return null;

  // Si no tiene createdAt o ya expiró, la eliminamos
  if (!ses.createdAt || (Date.now() - ses.createdAt) > MAX_SESSION_AGE_MS) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }

  return ses;
}

function borrarSesion() {
  localStorage.removeItem(SESSION_KEY);
}

// ===== Mostrar y cerrar modales =====
function mostrarLogin() {
  const m = document.getElementById('modal-login');
  if (m) m.style.display = 'block';
}
function mostrarRegistro() {
  const m = document.getElementById('modal-registro');
  if (m) m.style.display = 'block';
}
function cerrarModal() {
  const m1 = document.getElementById('modal-login');
  const m2 = document.getElementById('modal-registro');
  if (m1) m1.style.display = 'none';
  if (m2) m2.style.display = 'none';
}

// ===== Helper: fetch robusto =====
async function safeFetch(url, options) {
  let res;
  try {
    res = await fetch(url, { mode: 'cors', ...options });
  } catch (e) {
    // Error de red / CORS bloqueado
    throw new Error('No se pudo conectar al servidor. Verifica tu conexión o vuelve a intentar.');
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    // si el backend no envió JSON válido
  }

  if (!res.ok) {
    const msg = data?.error || `Error ${res.status}`;
    // Reenviamos el status para poder distinguir casos (ej: 403)
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data;
}

// ===== Guardar usuario nuevo (versión conectada al backend)
// Guardar usuario nuevo (versión optimizada con aviso inmediato)
async function registrarUsuario() {
  const modal = document.getElementById('modal-registro');
  const nombre = modal ? modal.querySelector('input[type="text"]')?.value.trim() : '';
  const correo = modal ? modal.querySelector('input[type="email"]')?.value.trim() : '';
  const pass   = modal ? modal.querySelector('input[type="password"]')?.value.trim() : '';

  if (!nombre || !correo || !pass) {
    alert('Por favor completa todos los campos.');
    return;
  }

  // 🔔 Mostrar mensaje inmediato sin esperar respuesta
  alert('Estamos enviando tu correo de confirmación. Esto puede tardar unos segundos...');

  try {
    const data = await safeFetch(`${BACKEND_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nombre, email: correo, password: pass })
    });

    // Si llegamos aquí, el backend registró y generó token (el envío de correo lo manejas con EmailJS o backend)
    cerrarModal();
    alert('✅ Registro exitoso. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.');
  } catch (err) {
    console.error(err);
    alert('⚠️ ' + (err.message || 'No se pudo registrar el usuario.'));
  }
}

// ===== Mostrar nombre si ya está logueado =====
function actualizarUsuario() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const sesion = cargarSesion();

  if (sesion) {
    // Si hay sesión válida, mostramos saludo + botón cerrar
    nav.innerHTML = `
      <span> Hola, ${sesion.nombre}</span>
      <button onclick="cerrarSesion()">Cerrar sesión</button>
    `;
  } else {
    // Si no hay sesión, no tocamos el nav (se queda con su HTML original)
    // Si quieres, aquí podrías restaurar manualmente el nav original
  }
}

// ===== Cerrar sesión =====
function cerrarSesion() {
  borrarSesion();
  location.reload();
}

// ===== Prueba gratuita =====
function enviarPrueba() {
  const el = document.getElementById('mensaje');
  if (el) {
    el.innerText = ' Datos enviados correctamente. Los resultados están listos — desbloquéalos adquiriendo el servicio premium 🔒';
  }
}

// ===== Pago simulado =====
function pagarPremium() {
  alert(' Simulando pago con Stripe (modo demo)... Redirigiendo al panel Premium');
  window.location.href = '/empresa';
}

// ===== Iniciar sesión (REAL contra el backend) =====
async function login() {
  const modal = document.getElementById('modal-login');
  const email = modal ? modal.querySelector('input[type="email"]')?.value.trim() : '';
  const pass  = modal ? modal.querySelector('input[type="password"]')?.value.trim() : '';

  if (!email || !pass) {
    alert('Por favor completa tus datos');
    return;
  }

  try {
    const data = await safeFetch(`${BACKEND_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });

    // Guardamos datos mínimos en localStorage (mantengo tu clave "usuarioPymax")
    const usuario = {
      nombre: data.name || email.split('@')[0],
      correo: data.email,
      token: data.session_token
    };
    guardarSesion(usuario);

    cerrarModal();
    actualizarUsuario();
    alert(` Bienvenido de nuevo, ${usuario.nombre}!`);
  } catch (err) {
    console.error(err);

    if (err.status === 401) {
      // El backend respondió 401 = credenciales inválidas
      alert('❌ Usuario o contraseña incorrectos.');
    } else if (err.status === 403) {
      // El backend respondió 403 = correo no confirmado
      alert('⚠️ Tu correo no está confirmado. Revisa tu bandeja de entrada.');
    } else {
      alert('❌ ' + (err.message || 'No se pudo iniciar sesión.'));
    }
  }
}

// ===== Ejecutar cuando carga la página =====
window.onload = actualizarUsuario;
// Respaldo adicional por si otro script sobreescribe onload
document.addEventListener('DOMContentLoaded', actualizarUsuario);
