-- =====================================================
-- PYMAX - AGREGAR COLUMNAS FALTANTES Y AJUSTAR TIPOS
-- =====================================================
-- Agrega las columnas que la aplicación está usando
-- y ajusta los tipos de datos
-- =====================================================

-- Agregar columna 'concept' a user_operations
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS concept TEXT;

-- Agregar otras columnas que podrían faltar
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- Modificar la restricción CHECK en 'type' para aceptar 'ingreso' y 'egreso'
ALTER TABLE user_operations DROP CONSTRAINT IF EXISTS user_operations_type_check;
ALTER TABLE user_operations ADD CONSTRAINT user_operations_type_check 
    CHECK (type IN ('income', 'expense', 'ingreso', 'egreso'));

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_user_operations_concept ON user_operations(concept);
CREATE INDEX IF NOT EXISTS idx_user_operations_status ON user_operations(status);
CREATE INDEX IF NOT EXISTS idx_user_operations_category ON user_operations(category);

-- Verificar columnas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_operations'
ORDER BY ordinal_position;

SELECT '✅ Columnas agregadas y tipos ajustados correctamente' as status;
