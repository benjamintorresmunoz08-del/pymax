-- ============================================================
-- ⚠️ PYMAX - BORRAR TODO (RESET COMPLETO)
-- ============================================================
-- ADVERTENCIA: Esto ELIMINA TODAS las tablas y datos.
-- Solo ejecuta si estás 100% seguro.
-- ============================================================

-- 1. ELIMINAR POLÍTICAS DE SEGURIDAD (RLS)
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON user_profiles;
DROP POLICY IF EXISTS "user_operations_select" ON user_operations;
DROP POLICY IF EXISTS "user_operations_insert" ON user_operations;
DROP POLICY IF EXISTS "user_operations_update" ON user_operations;
DROP POLICY IF EXISTS "user_operations_delete" ON user_operations;
DROP POLICY IF EXISTS "obligaciones_select" ON obligaciones;
DROP POLICY IF EXISTS "obligaciones_insert" ON obligaciones;
DROP POLICY IF EXISTS "obligaciones_update" ON obligaciones;
DROP POLICY IF EXISTS "obligaciones_delete" ON obligaciones;
DROP POLICY IF EXISTS "user_goals_select" ON user_goals;
DROP POLICY IF EXISTS "user_goals_insert" ON user_goals;
DROP POLICY IF EXISTS "user_goals_update" ON user_goals;
DROP POLICY IF EXISTS "user_goals_delete" ON user_goals;
DROP POLICY IF EXISTS "user_goals_extra_select" ON user_goals_extra;
DROP POLICY IF EXISTS "user_goals_extra_insert" ON user_goals_extra;
DROP POLICY IF EXISTS "user_goals_extra_update" ON user_goals_extra;
DROP POLICY IF EXISTS "user_goals_extra_delete" ON user_goals_extra;
DROP POLICY IF EXISTS "user_inventory_select" ON user_inventory;
DROP POLICY IF EXISTS "user_inventory_insert" ON user_inventory;
DROP POLICY IF EXISTS "user_inventory_update" ON user_inventory;
DROP POLICY IF EXISTS "user_inventory_delete" ON user_inventory;

-- 2. ELIMINAR TABLAS (en orden inverso de dependencias)
DROP TABLE IF EXISTS user_inventory CASCADE;
DROP TABLE IF EXISTS user_goals_extra CASCADE;
DROP TABLE IF EXISTS user_goals CASCADE;
DROP TABLE IF EXISTS obligaciones CASCADE;
DROP TABLE IF EXISTS user_operations CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 3. ELIMINAR FUNCIONES Y TRIGGERS (si los hubieras creado antes)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================
-- ✅ BASE DE DATOS LIMPIA. Ahora ejecuta el script 2.
-- ============================================================
