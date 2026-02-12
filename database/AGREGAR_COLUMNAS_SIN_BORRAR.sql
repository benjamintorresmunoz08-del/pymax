-- =====================================================
-- PYMAX - AGREGAR COLUMNAS FALTANTES (SIN BORRAR DATOS)
-- Ejecutar en Supabase SQL Editor
-- Este script es SEGURO - No borra nada
-- =====================================================

-- 1. AGREGAR COLUMNAS FALTANTES EN user_operations
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS cost_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS net_profit NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS counterparty VARCHAR(150);
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. AGREGAR COLUMNAS FALTANTES EN user_inventory (si la tabla existe)
ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 5;
ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 3. AGREGAR COLUMNAS FALTANTES EN obligaciones
ALTER TABLE obligaciones ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE obligaciones ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 4. CREAR user_profiles si no existe
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(150),
    company_name VARCHAR(150),
    preferred_currency VARCHAR(10) DEFAULT 'USD',
    preferred_language VARCHAR(10) DEFAULT 'es',
    timezone VARCHAR(50) DEFAULT 'UTC',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. CREAR ÍNDICES SI NO EXISTEN
CREATE INDEX IF NOT EXISTS idx_operations_metadata ON user_operations USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON user_profiles(user_id);

-- 6. HABILITAR RLS EN NUEVAS TABLAS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS PARA user_profiles (si no existen)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" ON user_profiles
            FOR SELECT USING (auth.uid()::text = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile" ON user_profiles
            FOR INSERT WITH CHECK (auth.uid()::text = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" ON user_profiles
            FOR UPDATE USING (auth.uid()::text = user_id);
    END IF;
END$$;

-- 8. FUNCIÓN PARA ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. TRIGGERS PARA updated_at (solo si no existen)
DROP TRIGGER IF EXISTS update_operations_updated_at ON user_operations;
CREATE TRIGGER update_operations_updated_at BEFORE UPDATE ON user_operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON user_inventory;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON user_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver columnas de user_operations
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_operations' 
ORDER BY ordinal_position;

-- Mensaje de confirmación
SELECT '✅ Columnas agregadas exitosamente!' as status;
