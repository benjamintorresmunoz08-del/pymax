-- ============================================================
-- FIX: Problema "No se pudo guardar la selección"
-- ============================================================
-- EJECUTAR ESTO EN SUPABASE > SQL EDITOR
-- ============================================================

-- 1. ELIMINAR POLÍTICAS ANTERIORES (si existen)
DROP POLICY IF EXISTS "Usuarios ven su perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuarios crean su perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuarios actualizan su perfil" ON user_profiles;

-- 2. CREAR POLÍTICAS CORRECTAS

-- Permitir SELECT (ver su perfil)
CREATE POLICY "Usuarios ven su perfil" 
ON user_profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Permitir INSERT (crear su perfil al registrarse)
CREATE POLICY "Usuarios crean su perfil" 
ON user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Permitir UPDATE (actualizar su account_type, etc.)
CREATE POLICY "Usuarios actualizan su perfil" 
ON user_profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. VERIFICAR QUE RLS ESTÉ ACTIVO
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ✅ LISTO. Ahora selectRole() debería funcionar.
-- ============================================================
