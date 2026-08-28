// PYMAX - AUTENTICACIÓN REAL CON SUPABASE
// Verifica sesión leyendo localmente primero (getSession) para no rebotar
// falsamente a usuarios ya autenticados por un token expirado o un fallo de red.

async function checkRealAuth(supabaseClient) {
    let user = null;

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        user = session && session.user;
    } catch (e) {
        console.warn('⚠️ getSession falló, intentando getUser:', e);
    }

    if (!user) {
        try {
            const { data: { user: u }, error } = await supabaseClient.auth.getUser();
            if (!error) user = u;
        } catch (e) {
            console.warn('⚠️ getUser falló:', e);
        }
    }

    if (!user) {
        console.error('❌ No se detectó sesión activa en Supabase.');
        await Swal.fire({
            title: 'Sesión requerida',
            text: 'Debes iniciar sesión para acceder a este módulo',
            icon: 'warning',
            confirmButtonText: 'Ir a login',
            background: '#0b0b14',
            color: '#fff',
            allowOutsideClick: false
        });
        window.location.href = '/';
        return null;
    }

    console.log('✅ Usuario autenticado:', user.email);
    return user;
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.checkRealAuth = checkRealAuth;
}
