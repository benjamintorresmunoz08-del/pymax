-- =====================================================
-- PYMAX - ACTIVAR RLS PARA PRODUCCIÓN
-- =====================================================
-- ⚠️ EJECUTAR ESTO SOLO CUANDO ESTÉS LISTO PARA PRODUCCIÓN
-- ⚠️ HACER BACKUP DE LA BASE DE DATOS PRIMERO
-- =====================================================

-- PASO 1: VERIFICAR TIPOS DE COLUMNAS ACTUALES
-- =====================================================
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name IN ('user_profiles', 'user_operations', 'user_inventory', 'obligaciones', 'user_goals', 'user_goals_extra')
  AND column_name IN ('id', 'user_id')
ORDER BY table_name, column_name;

-- =====================================================
-- PASO 2: MIGRAR COLUMNAS A UUID (si no lo son)
-- =====================================================
-- ⚠️ ESTO PUEDE TOMAR TIEMPO SI HAY MUCHOS REGISTROS
-- ⚠️ HACER BACKUP ANTES

-- user_profiles
DO $$ 
BEGIN
    -- Si id no es UUID, convertir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE user_profiles 
        ALTER COLUMN id TYPE UUID USING id::uuid;
    END IF;

    -- Si user_id no es UUID, convertir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'user_id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE user_profiles 
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    END IF;
END $$;

-- user_operations
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_operations' 
        AND column_name = 'user_id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE user_operations 
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    END IF;
END $$;

-- user_inventory
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_inventory' 
        AND column_name = 'user_id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE user_inventory 
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    END IF;
END $$;

-- obligaciones
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'obligaciones' 
        AND column_name = 'user_id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE obligaciones 
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    END IF;
END $$;

-- user_goals
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_goals' 
        AND column_name = 'user_id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE user_goals 
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    END IF;
END $$;

-- user_goals_extra
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_goals_extra' 
        AND column_name = 'user_id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE user_goals_extra 
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    END IF;
END $$;

-- =====================================================
-- PASO 3: ACTIVAR RLS EN TODAS LAS TABLAS
-- =====================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals_extra ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 4: CREAR POLÍTICAS RLS CORRECTAS (con UUID)
-- =====================================================

-- user_profiles (id es la PK y es el user_id de auth)
DROP POLICY IF EXISTS "Users manage own profile" ON user_profiles;
CREATE POLICY "Users manage own profile" ON user_profiles
    FOR ALL
    USING (auth.uid() = id);  -- ✅ UUID = UUID directo

-- user_operations
DROP POLICY IF EXISTS "Users manage own operations" ON user_operations;
CREATE POLICY "Users manage own operations" ON user_operations
    FOR ALL
    USING (auth.uid() = user_id);  -- ✅ UUID = UUID directo

-- user_inventory
DROP POLICY IF EXISTS "Users manage own inventory" ON user_inventory;
CREATE POLICY "Users manage own inventory" ON user_inventory
    FOR ALL
    USING (auth.uid() = user_id);  -- ✅ UUID = UUID directo

-- obligaciones
DROP POLICY IF EXISTS "Users manage own obligations" ON obligaciones;
CREATE POLICY "Users manage own obligations" ON obligaciones
    FOR ALL
    USING (auth.uid() = user_id);  -- ✅ UUID = UUID directo

-- user_goals
DROP POLICY IF EXISTS "Users manage own goals" ON user_goals;
CREATE POLICY "Users manage own goals" ON user_goals
    FOR ALL
    USING (auth.uid() = user_id);  -- ✅ UUID = UUID directo

-- user_goals_extra
DROP POLICY IF EXISTS "Users manage own goals extra" ON user_goals_extra;
CREATE POLICY "Users manage own goals extra" ON user_goals_extra
    FOR ALL
    USING (auth.uid() = user_id);  -- ✅ UUID = UUID directo

-- =====================================================
-- PASO 5: VERIFICAR QUE TODO FUNCIONA
-- =====================================================

-- Ver estado de RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'user_operations', 'user_inventory', 'obligaciones', 'user_goals', 'user_goals_extra');

-- Ver políticas activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Probar autenticación (ejecuta esto siendo un usuario autenticado)
SELECT 
    'Test Auth' as test,
    auth.uid() as current_user_id,
    (SELECT COUNT(*) FROM user_profiles WHERE id = auth.uid()) as can_see_own_profile,
    (SELECT COUNT(*) FROM user_operations WHERE user_id = auth.uid()) as can_see_own_operations;

SELECT '✅ RLS ACTIVADO Y CONFIGURADO PARA PRODUCCIÓN' as status;

-- =====================================================
-- ⚠️ IMPORTANTE - DESPUÉS DE ACTIVAR RLS:
-- =====================================================
-- 1. TODOS los usuarios DEBEN estar autenticados con Supabase Auth
-- 2. Ya NO se pueden hacer queries sin autenticación
-- 3. Cada usuario solo verá SUS PROPIOS datos
-- 4. Los datos están PROTEGIDOS y seguros
-- 5. Si algo falla, usa: ALTER TABLE tabla DISABLE ROW LEVEL SECURITY;
-- =====================================================
