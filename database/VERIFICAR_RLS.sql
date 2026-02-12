-- =====================================================
-- PYMAX - VERIFICAR Y CORREGIR RLS
-- =====================================================

-- PASO 1: Ver las políticas RLS actuales
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- PASO 2: Verificar qué tablas tienen RLS activado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_operations', 'user_inventory', 'obligaciones', 'user_goals', 'user_profiles');

-- =====================================================
-- PASO 3: CORREGIR POLÍTICAS RLS
-- =====================================================

-- 3.1: Asegurarse de que RLS está ACTIVADO (es bueno para seguridad)
ALTER TABLE user_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3.2: ELIMINAR políticas antiguas que puedan causar conflictos
DROP POLICY IF EXISTS "Users can view own operations" ON user_operations;
DROP POLICY IF EXISTS "Users can insert own operations" ON user_operations;
DROP POLICY IF EXISTS "Users can update own operations" ON user_operations;
DROP POLICY IF EXISTS "Users can delete own operations" ON user_operations;

DROP POLICY IF EXISTS "Users can view own inventory" ON user_inventory;
DROP POLICY IF EXISTS "Users can insert own inventory" ON user_inventory;
DROP POLICY IF EXISTS "Users can update own inventory" ON user_inventory;
DROP POLICY IF EXISTS "Users can delete own inventory" ON user_inventory;

DROP POLICY IF EXISTS "Users can view own obligations" ON obligaciones;
DROP POLICY IF EXISTS "Users can insert own obligations" ON obligaciones;
DROP POLICY IF EXISTS "Users can update own obligations" ON obligaciones;
DROP POLICY IF EXISTS "Users can delete own obligations" ON obligaciones;

DROP POLICY IF EXISTS "Users can view own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can update own goals" ON user_goals;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- 3.3: CREAR políticas CORRECTAS para user_operations
CREATE POLICY "Users can view own operations" ON user_operations
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own operations" ON user_operations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own operations" ON user_operations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own operations" ON user_operations
    FOR DELETE
    USING (auth.uid() = user_id);

-- 3.4: CREAR políticas para user_inventory
CREATE POLICY "Users can view own inventory" ON user_inventory
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory" ON user_inventory
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON user_inventory
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory" ON user_inventory
    FOR DELETE
    USING (auth.uid() = user_id);

-- 3.5: CREAR políticas para obligaciones
CREATE POLICY "Users can view own obligations" ON obligaciones
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own obligations" ON obligaciones
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own obligations" ON obligaciones
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own obligations" ON obligaciones
    FOR DELETE
    USING (auth.uid() = user_id);

-- 3.6: CREAR políticas para user_goals
CREATE POLICY "Users can view own goals" ON user_goals
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON user_goals
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON user_goals
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3.7: CREAR políticas para user_goals_extra
CREATE POLICY "Users can view own extra goals" ON user_goals_extra
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own extra goals" ON user_goals_extra
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own extra goals" ON user_goals_extra
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3.8: CREAR políticas para user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- PASO 4: VERIFICAR QUE LAS POLÍTICAS ESTÁN CORRECTAS
-- =====================================================

SELECT 
    tablename, 
    policyname, 
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check::text
        ELSE 'No WITH CHECK clause'
    END as check_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_operations', 'user_inventory', 'obligaciones', 'user_goals', 'user_profiles')
ORDER BY tablename, cmd;

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Con estas políticas, SOLO el usuario autenticado puede:
--    - Ver sus propios datos (SELECT)
--    - Crear nuevos registros para sí mismo (INSERT)
--    - Modificar sus propios registros (UPDATE)
--    - Eliminar sus propios registros (DELETE)
--
-- 2. auth.uid() devuelve el ID del usuario autenticado en Supabase Auth
--
-- 3. Si el error persiste después de ejecutar esto, verifica:
--    - Que el usuario está realmente autenticado (console.log en el navegador)
--    - Que el user_id en los registros coincide con auth.uid()
--    - Que no hay triggers o funciones que interfieran
--
-- 4. Para debugging, puedes ejecutar temporalmente:
--    SELECT auth.uid(); -- Debería devolver el UUID del usuario actual
--
SELECT '✅ Políticas RLS configuradas correctamente' as status;
