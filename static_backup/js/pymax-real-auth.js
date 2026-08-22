// PYMAX - AUTENTICACIÓN REAL CON SUPABASE
// Este script verifica que el usuario esté autenticado con Supabase Auth

async function checkRealAuth(supabaseClient) {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error || !user) {
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
