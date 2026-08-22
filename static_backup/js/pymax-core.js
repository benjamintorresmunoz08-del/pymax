/******************************************************
 * PYMAX CORE v6.0 (COMPLETO: CONEXIÓN + BASE DE DATOS)
 ******************************************************/

const SUPABASE_URL = "https://haqjuyagyvxynmulanhe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcWp1eWFneXZ4eW5tdWxhbmhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjU0MjQsImV4cCI6MjA4MTQwMTQyNH0.3aSIfr3s5spESzEv_UAaqYkJzVyhbkK8ZpSlExY0A3g";
const PYMAX_BACKEND_URL = "https://pymax-backend-6d37.onrender.com"; 

// === 1. INICIALIZACIÓN SEGURA ===
try {
    if (typeof window.supabase !== 'undefined') {
        if (typeof window.supabase.createClient === 'function') {
            window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("✅ Pymax: Conexion establecida.");
        } 
    } else {
        console.error("❌ Error: Libreria Supabase no encontrada.");
    }
} catch (e) {
    console.error("Error inicializando Supabase:", e);
}

// === 2. GESTIÓN DE USUARIOS ===
async function pymaxGetUser() {
    if (!window.supabase || !window.supabase.auth) return null;
    const { data } = await window.supabase.auth.getUser();
    return data?.user || null;
}

async function pymaxLogout() {
    if (window.supabase && window.supabase.auth) {
        await window.supabase.auth.signOut();
        window.location.href = "/";
    }
}

// === 3. FUNCIONES DE BASE DE DATOS (ESTAS FALTABAN) ===

// A) CREAR MOVIMIENTO
async function pymaxCrearMovimiento(datos) {
    const user = await pymaxGetUser();
    if (!user) return { error: { message: "No estas logueado" } };

    // Insertamos en la tabla 'movimientos'
    // Asegúrate de que tu tabla en Supabase se llame 'movimientos'
    const { data, error } = await window.supabase
        .from('movimientos')
        .insert([
            {
                user_id: user.id,
                tipo: datos.tipo,         // 'ingreso' o 'gasto'
                categoria: datos.categoria,
                monto: datos.monto,
                fecha: datos.fecha,
                descripcion: datos.descripcion
            }
        ]);

    return { data, error };
}

// B) LEER MOVIMIENTOS
async function pymaxLeerMovimientos() {
    const user = await pymaxGetUser();
    if (!user) return [];

    const { data, error } = await window.supabase
        .from('movimientos')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha', { ascending: false }); // Ordenar del más reciente al más antiguo

    if (error) {
        console.error("Error leyendo DB:", error);
        return [];
    }
    return data || [];
}

// C) CONSULTAR CEREBRO PYTHON (OPCIONAL)
async function pymaxConsultarAnalisis() {
    const user = await pymaxGetUser();
    if (!user) return null;

    try {
        const response = await fetch(`${PYMAX_BACKEND_URL}/progreso?user_id=${user.id}`);
        return await response.json();
    } catch (e) {
        console.error("Error conectando con cerebro:", e);
        return null;
    }
}

console.log("Pymax Core v6.0 (Full Database) cargado.");