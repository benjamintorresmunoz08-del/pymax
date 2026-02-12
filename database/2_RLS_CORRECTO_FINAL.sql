-- =====================================================
-- PYMAX - RLS CORRECTO (BASADO EN TUS TIPOS DE DATOS)
-- =====================================================

-- PASO 1: Activar RLS en todas las tablas
ALTER TABLE user_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar políticas antiguas
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

DROP POLICY IF EXISTS "Users can view own extra goals" ON user_goals_extra;
DROP POLICY IF EXISTS "Users can insert own extra goals" ON user_goals_extra;
DROP POLICY IF EXISTS "Users can update own extra goals" ON user_goals_extra;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- =====================================================
-- PASO 3: CREAR POLÍTICAS CORRECTAS
-- Usando: auth.uid()::text = user_id (VARCHAR)
-- =====================================================

-- 3.1: Políticas para user_operations
CREATE POLICY "Users can view own operations" ON user_operations
    FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own operations" ON user_operations
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own operations" ON user_operations
    FOR UPDATE
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own operations" ON user_operations
    FOR DELETE
    USING (auth.uid()::text = user_id);

-- 3.2: Políticas para user_inventory
CREATE POLICY "Users can view own inventory" ON user_inventory
    FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own inventory" ON user_inventory
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own inventory" ON user_inventory
    FOR UPDATE
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own inventory" ON user_inventory
    FOR DELETE
    USING (auth.uid()::text = user_id);

-- 3.3: Políticas para obligaciones
CREATE POLICY "Users can view own obligations" ON obligaciones
    FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own obligations" ON obligaciones
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own obligations" ON obligaciones
    FOR UPDATE
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own obligations" ON obligaciones
    FOR DELETE
    USING (auth.uid()::text = user_id);

-- 3.4: Políticas para user_goals
CREATE POLICY "Users can view own goals" ON user_goals
    FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own goals" ON user_goals
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own goals" ON user_goals
    FOR UPDATE
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- 3.5: Políticas para user_goals_extra
CREATE POLICY "Users can view own extra goals" ON user_goals_extra
    FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own extra goals" ON user_goals_extra
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own extra goals" ON user_goals_extra
    FOR UPDATE
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- 3.6: Políticas para user_profiles
-- NOTA: user_profiles también tiene user_id VARCHAR
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- =====================================================
-- PASO 4: VERIFICAR
-- =====================================================

SELECT 
    tablename, 
    policyname, 
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_operations', 'user_inventory', 'obligaciones', 'user_goals', 'user_profiles')
ORDER BY tablename, cmd;

SELECT '✅ Políticas RLS creadas correctamente' as status;

-- =====================================================
-- EXPLICACIÓN:
-- =====================================================
-- auth.uid()::text = user_id
--   ↓              ↓
--   UUID convertido a TEXT = VARCHAR (tu columna)
--
-- Esto funciona porque:
-- 1. auth.uid() devuelve el UUID del usuario autenticado
-- 2. ::text lo convierte a texto
-- 3. user_id es VARCHAR (texto) con el UUID almacenado
-- 4. Los comparamos como texto
-- =====================================================
