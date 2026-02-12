-- =====================================================
-- CREAR/ACTUALIZAR TABLA USER_PROFILES
-- =====================================================

-- PASO 1: Eliminar tabla si existe (CUIDADO: Borra datos)
-- Descomenta solo si quieres empezar desde cero
-- DROP TABLE IF EXISTS user_profiles CASCADE;

-- PASO 2: Crear tabla user_profiles con TODAS las columnas necesarias
CREATE TABLE IF NOT EXISTS user_profiles (
    -- Identificación
    id TEXT PRIMARY KEY,  -- UUID del usuario de Supabase Auth (como TEXT)
    user_id TEXT,         -- Redundancia por compatibilidad
    
    -- Información personal
    full_name TEXT,
    email TEXT,
    phone TEXT,
    
    -- Configuración de cuenta
    account_type TEXT,    -- 'empresa' o 'personal' ← COLUMNA QUE FALTABA
    
    -- Preferencias
    currency TEXT DEFAULT 'USD',
    currency_symbol TEXT DEFAULT '$',
    language TEXT DEFAULT 'es',
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 3: Si la tabla ya existe, agregar columnas faltantes
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS account_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS currency_symbol TEXT DEFAULT '$';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'es';

-- PASO 4: Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON user_profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- PASO 5: Activar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- PASO 6: Eliminar políticas antiguas
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- PASO 7: Crear políticas RLS correctas
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT
    USING (auth.uid()::text = id OR auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT
    WITH CHECK (auth.uid()::text = id OR auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE
    USING (auth.uid()::text = id OR auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = id OR auth.uid()::text = user_id);

-- PASO 8: Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASO 9: Crear trigger
DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- PASO 10: Verificar estructura
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Debe mostrar estas columnas:
-- - id (text)
-- - user_id (text)
-- - full_name (text)
-- - email (text)
-- - phone (text)
-- - account_type (text) ← ESTA ES LA QUE FALTABA
-- - currency (text)
-- - currency_symbol (text)
-- - language (text)
-- - created_at (timestamp with time zone)
-- - updated_at (timestamp with time zone)
-- =====================================================

SELECT '✅ Tabla user_profiles creada/actualizada correctamente' as status;
