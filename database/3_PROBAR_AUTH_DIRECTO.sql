-- =====================================================
-- PROBAR AUTENTICACIÓN DIRECTAMENTE EN SUPABASE
-- =====================================================

-- PASO 1: Ver usuarios registrados
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- PASO 2: Ver si tienes datos en user_operations
SELECT 
    id,
    user_id,
    type,
    amount,
    concept,
    created_at
FROM user_operations
ORDER BY created_at DESC
LIMIT 10;

-- PASO 3: Probar si las políticas RLS funcionan
-- Esto simula lo que pasa cuando un usuario autenticado intenta acceder
-- NOTA: Esto solo funciona si estás ejecutando como usuario autenticado

-- Ver el UUID del usuario actual
SELECT auth.uid() as mi_user_id;

-- Ver si puedes ver tus propias operaciones
SELECT COUNT(*) as mis_operaciones
FROM user_operations
WHERE user_id = auth.uid()::text;

-- =====================================================
-- INSTRUCCIONES:
-- =====================================================
-- 1. Ejecuta cada query por separado en Supabase
-- 2. El PASO 1 te mostrará todos los usuarios
-- 3. El PASO 2 te mostrará si hay operaciones guardadas
-- 4. El PASO 3 verificará si RLS funciona correctamente
--
-- Si PASO 3 devuelve un número, RLS funciona ✅
-- Si PASO 3 devuelve error, RLS tiene problemas ❌
-- =====================================================
