// =====================================================
// PYMAX CORE · FRONTEND CENTRAL
// =====================================================

// =========================
// SUPABASE (PÚBLICO)
// =========================
const SUPABASE_URL = "https://haqjuyagyvxynmulanhe.supabase.co";
const SUPABASE_PUBLIC_KEY = "PEGA_AQUI_TU_PUBLIC_ANON_KEY_REAL";

// ⚠️ IMPORTANTE
// - SOLO PUBLIC ANON KEY
// - NUNCA service_role en frontend

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLIC_KEY
);

// =========================
// BACKEND
// =========================
const BACKEND_URL = "https://pymax-backend-6d37.onrender.com";

// =====================================================
// USUARIO
// =====================================================
async function getUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    console.warn("Usuario no autenticado");
    return null;
  }

  return data.user.id;
}

// =====================================================
// ESTADO FINANCIERO CENTRAL (CORE)
// =====================================================
async function getEstadoFinanciero() {
  const user_id = await getUserId();
  if (!user_id) return null;

  const res = await fetch(
    `${BACKEND_URL}/estado-financiero?user_id=${user_id}`
  );

  if (!res.ok) {
    console.error("Error obteniendo estado financiero");
    return null;
  }

  return await res.json();
}

// =====================================================
// MOVIMIENTOS
// =====================================================
async function crearMovimiento(data) {
  const user_id = await getUserId();
  if (!user_id) return false;

  await fetch(`${BACKEND_URL}/movimientos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      user_id
    })
  });

  return true;
}

// =====================================================
// OBLIGACIONES
// =====================================================
async function crearObligacion(data) {
  const user_id = await getUserId();
  if (!user_id) return false;

  await fetch(`${BACKEND_URL}/obligaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      user_id
    })
  });

  return true;
}

async function obtenerObligaciones() {
  const user_id = await getUserId();
  if (!user_id) return [];

  const res = await fetch(
    `${BACKEND_URL}/obligaciones?user_id=${user_id}`
  );

  return await res.json();
}

// =====================================================
// CALENDARIO
// =====================================================
async function crearEventoCalendario(data) {
  const user_id = await getUserId();
  if (!user_id) return false;

  await fetch(`${BACKEND_URL}/calendario`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      user_id
    })
  });

  return true;
}

async function obtenerEventosCalendario() {
  const user_id = await getUserId();
  if (!user_id) return [];

  const res = await fetch(
    `${BACKEND_URL}/calendario?user_id=${user_id}`
  );

  return await res.json();
}

// =====================================================
// EXCEL
// =====================================================
async function descargarExcel() {
  const user_id = await getUserId();
  if (!user_id) return;

  window.open(
    `${BACKEND_URL}/exportar-excel?user_id=${user_id}`,
    "_blank"
  );
}

// =====================================================
// IA PYMAX (BASE · SE COMPLETA EN FASE 3)
// =====================================================
function generarConsejosIA(estado) {
  if (!estado) return [];

  const consejos = [];

  if (estado.flujo_actual < 0) {
    consejos.push("El flujo de caja es negativo. Prioriza reducir gastos fijos.");
  }

  if (estado.semaforo === "AMARILLO") {
    consejos.push("Revisa tus compromisos próximos y evita nuevas obligaciones.");
  }

  if (estado.semaforo === "ROJO") {
    consejos.push("Es necesario tomar decisiones inmediatas para recuperar liquidez.");
  }

  if (estado.orden_financiero < 50) {
    consejos.push("Incrementa la constancia de registros diarios para mejorar el orden financiero.");
  }

  return consejos.slice(0, 3);
}
