-- ============================================================
-- Agregar columna tour_completed a user_profiles
-- Ejecutar en Supabase SQL Editor
-- ============================================================

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT FALSE;

-- Verificar que se creó
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'tour_completed';
