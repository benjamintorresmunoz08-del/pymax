-- =====================================================
-- PYMAX - SCRIPT DEFINITIVO - EJECUTAR ESTE
-- Soluciona TODOS los problemas de una vez
-- =====================================================

-- PARTE 1: CREAR/ACTUALIZAR user_profiles
-- =====================================================

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    account_type TEXT,
    currency TEXT DEFAULT 'USD',
    currency_symbol TEXT DEFAULT '$',
    language TEXT DEFAULT 'es',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar columnas si faltan (no da error si ya existen)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS account_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS currency_symbol TEXT DEFAULT '$';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'es';

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON user_profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- PARTE 2: CREAR/ACTUALIZAR otras tablas
-- =====================================================

CREATE TABLE IF NOT EXISTS user_operations (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    concept TEXT,
    type TEXT,
    category TEXT,
    cost_amount NUMERIC(10,2) DEFAULT 0,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    net_profit NUMERIC(10,2) DEFAULT 0,
    counterparty TEXT,
    payment_method TEXT,
    tags TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS cost_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS net_profit NUMERIC(10,2) DEFAULT 0;
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS counterparty TEXT;

CREATE TABLE IF NOT EXISTS user_inventory (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    current_stock INTEGER DEFAULT 0,
    cost_price NUMERIC(10,2) DEFAULT 0,
    sale_price NUMERIC(10,2) DEFAULT 0,
    tax_percent NUMERIC(5,2) DEFAULT 0,
    supplier TEXT,
    category TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

CREATE TABLE IF NOT EXISTS obligaciones (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    email_contacto TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_goals (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    goal_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_goals_extra (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    slot_number INTEGER NOT NULL,
    goal_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARTE 3: ACTIVAR RLS EN TODAS LAS TABLAS
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals_extra ENABLE ROW LEVEL SECURITY;

-- PARTE 4: ELIMINAR POLÍTICAS ANTIGUAS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

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

-- PARTE 5: CREAR POLÍTICAS RLS CORRECTAS
-- =====================================================

-- user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = id OR auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id OR auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = id OR auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = id OR auth.uid()::text = user_id);

-- user_operations
CREATE POLICY "Users can view own operations" ON user_operations
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own operations" ON user_operations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own operations" ON user_operations
    FOR UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own operations" ON user_operations
    FOR DELETE USING (auth.uid()::text = user_id);

-- user_inventory
CREATE POLICY "Users can view own inventory" ON user_inventory
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own inventory" ON user_inventory
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own inventory" ON user_inventory
    FOR UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own inventory" ON user_inventory
    FOR DELETE USING (auth.uid()::text = user_id);

-- obligaciones
CREATE POLICY "Users can view own obligations" ON obligaciones
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own obligations" ON obligaciones
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own obligations" ON obligaciones
    FOR UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own obligations" ON obligaciones
    FOR DELETE USING (auth.uid()::text = user_id);

-- user_goals
CREATE POLICY "Users can view own goals" ON user_goals
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own goals" ON user_goals
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own goals" ON user_goals
    FOR UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- user_goals_extra
CREATE POLICY "Users can view own extra goals" ON user_goals_extra
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own extra goals" ON user_goals_extra
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own extra goals" ON user_goals_extra
    FOR UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- PARTE 6: VERIFICACIÓN FINAL
-- =====================================================

-- Ver todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'user_operations', 'user_inventory', 'obligaciones', 'user_goals', 'user_goals_extra')
ORDER BY table_name;

-- Ver columnas de user_profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

SELECT '✅ BASE DE DATOS CONFIGURADA CORRECTAMENTE' as status;
