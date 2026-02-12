# 🔧 Problemas Resueltos

## Error 1: Modal aparece inmediatamente al confirmar email

**Problema:** Después de confirmar el correo, el usuario era redirigido y el modal de selección aparecía automáticamente, sin opción de ver la página principal.

**Solución aplicada:**
- El modal **YA NO** se abre automáticamente.
- Ahora, si un usuario confirma su email o inicia sesión sin rol configurado, verá un botón en el nav: **"Configurar Cuenta"**.
- El modal solo aparece cuando hacen clic en ese botón.
- Se detecta si vienen de confirmación de email y NO se auto-redirige.

**Cambios en `index.html`:**
- Detecta confirmación de email con `window.location.hash`.
- Reemplazada función `verificarIdentidad` por `mostrarBotonConfigurar`.
- Modal solo se abre manualmente.

---

## Error 2: "No se pudo guardar la selección"

**Problema:** Al elegir "Arquitecto de Vida" o "Imperio Autónomo", la función `selectRole()` fallaba al guardar en `user_profiles`.

**Causas posibles:**
1. Falta de permisos RLS (Row Level Security) en Supabase.
2. Sintaxis incorrecta en `upsert`.
3. Perfil no existe y falla el `update`.

**Solución aplicada:**
- Cambio de lógica: primero intenta `UPDATE`, si falla hace `INSERT`.
- Mejor manejo de errores con logs detallados en consola.
- Mensaje de error más descriptivo que incluye el problema real.

**Qué debes hacer en Supabase:**
1. Abre el archivo: `setup/FIX_USER_PROFILES_RLS.sql`
2. Copia TODO el contenido.
3. Pégalo en **Supabase** > **SQL Editor** > **New Query**.
4. Clic en **Run**.

Esto creará las políticas correctas para INSERT y UPDATE en `user_profiles`.

---

## Mejoras adicionales

### Modal responsive para móvil/tablet
- Añadido `max-height: 90vh` y `overflow-y: auto`.
- Padding reducido en móvil.
- Scroll funcional en dispositivos pequeños.

---

## Verificar que funciona

1. **Ejecuta el SQL** en Supabase (FIX_USER_PROFILES_RLS.sql).
2. **Haz git push** de los cambios.
3. Render hará redeploy automático.
4. Prueba registrarte con un nuevo correo o usar una cuenta sin rol.

Si persiste el error, abre F12 > Console y comparte el mensaje exacto.
