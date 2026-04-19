-- ============================================================================
-- PYMAX: Tabla de Perfiles de Negocio
-- Almacena la configuración del onboarding y preferencias por usuario
-- ============================================================================

-- Crear tabla user_business_profiles
CREATE TABLE IF NOT EXISTS user_business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información del negocio
  business_type VARCHAR(50) NOT NULL CHECK (business_type IN ('tecnico', 'gastronomia', 'profesional', 'bienestar', 'retail')),
  business_name VARCHAR(255) NOT NULL,
  industry_label VARCHAR(100),
  
  -- Estado del onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  onboarding_completed_at TIMESTAMP,
  
  -- Configuración del dashboard (JSON)
  dashboard_config JSONB DEFAULT '{}'::jsonb,
  widget_preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraint: Un perfil por usuario
  UNIQUE(user_id)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_user_business_profiles_user_id 
  ON user_business_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_business_profiles_business_type 
  ON user_business_profiles(business_type);

CREATE INDEX IF NOT EXISTS idx_user_business_profiles_onboarding_completed 
  ON user_business_profiles(onboarding_completed);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE user_business_profiles ENABLE ROW LEVEL SECURITY;

-- Política 1: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view their own profile"
  ON user_business_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política 2: Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert their own profile"
  ON user_business_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política 3: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update their own profile"
  ON user_business_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política 4: Los usuarios pueden eliminar su propio perfil
CREATE POLICY "Users can delete their own profile"
  ON user_business_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCIÓN: Actualizar timestamp automáticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_business_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_user_business_profiles_updated_at ON user_business_profiles;

CREATE TRIGGER trigger_update_user_business_profiles_updated_at
  BEFORE UPDATE ON user_business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_business_profiles_updated_at();

-- ============================================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE user_business_profiles IS 'Perfiles de negocio de usuarios para dashboard adaptable';
COMMENT ON COLUMN user_business_profiles.business_type IS 'Tipo de negocio: tecnico, gastronomia, profesional, bienestar, retail';
COMMENT ON COLUMN user_business_profiles.business_name IS 'Nombre del negocio ingresado por el usuario';
COMMENT ON COLUMN user_business_profiles.dashboard_config IS 'Configuración JSON del dashboard (moneda, preferencias, etc)';
COMMENT ON COLUMN user_business_profiles.widget_preferences IS 'Preferencias JSON de widgets (orden, visibilidad, etc)';

-- ============================================================================
-- DATOS DE EJEMPLO (Opcional - Solo para testing)
-- ============================================================================

-- Descomentar si quieres insertar datos de prueba
/*
INSERT INTO user_business_profiles (user_id, business_type, business_name, industry_label, onboarding_completed, dashboard_config)
VALUES 
  (
    '00000000-0000-0000-0000-000000000000', -- Reemplazar con un user_id real
    'tecnico',
    'Taller Mecánico El Rayo',
    'Técnico & Talleres',
    true,
    '{"currency": "CLP", "contact_email": "contacto@elrayo.cl"}'::jsonb
  );
*/

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar que la tabla fue creada correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_business_profiles'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_business_profiles';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
