-- ============================================================================
-- PYMAX · ESQUEMA MAESTRO SEGURO  (nivel "banco mundial")
-- ----------------------------------------------------------------------------
-- 1) Corrige TODOS los desajustes de columnas (código <-> base de datos).
-- 2) Crea las tablas que faltan (user_products, calendar_events).
-- 3) Endurece la seguridad: RLS FORCE + políticas por usuario en TODAS las tablas.
-- 4) Revoca accesos públicos y limpia tablas legacy.
--
-- CÓMO USAR: Supabase → SQL Editor → New Query → pegar TODO → Run.
-- Es IDEMPOTENTE: puedes re-ejecutarlo sin romper nada.
-- ============================================================================

-- ============================================================================
-- 0. FUNCIÓN DE UTILIDAD: auto-actualizar updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- A. CORREGIR DESAJUSTES DE COLUMNAS  (código <-> base de datos)
-- ============================================================================

-- A1. user_inventory  →  el código usa product_name / current_stock / min_stock
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='user_inventory' AND column_name='name')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='user_inventory' AND column_name='product_name') THEN
    ALTER TABLE user_inventory RENAME COLUMN name TO product_name;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='user_inventory' AND column_name='quantity')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='user_inventory' AND column_name='current_stock') THEN
    ALTER TABLE user_inventory RENAME COLUMN quantity TO current_stock;
  END IF;
END $$;

ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS current_stock INT DEFAULT 0;
ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS min_stock INT DEFAULT 5;
ALTER TABLE user_inventory DROP COLUMN IF EXISTS category;
ALTER TABLE user_inventory DROP COLUMN IF EXISTS status;

-- A2. user_goals  →  el código usa goal_text
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='user_goals' AND column_name='goal_type')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='user_goals' AND column_name='goal_text') THEN
    ALTER TABLE user_goals RENAME COLUMN goal_type TO goal_text;
  END IF;
END $$;
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS goal_text TEXT;

-- A3. user_goals_extra  →  el código usa slot_number + goal_text
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='user_goals_extra' AND column_name='title')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='user_goals_extra' AND column_name='goal_text') THEN
    ALTER TABLE user_goals_extra RENAME COLUMN title TO goal_text;
  END IF;
END $$;
ALTER TABLE user_goals_extra ADD COLUMN IF NOT EXISTS goal_text TEXT;
ALTER TABLE user_goals_extra ADD COLUMN IF NOT EXISTS slot_number INT;
UPDATE user_goals_extra SET goal_text = COALESCE(goal_text, description) WHERE goal_text IS NULL;

-- A4. obligaciones  →  asegurar columnas esperadas (idempotente)
ALTER TABLE obligaciones ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'pendiente';
ALTER TABLE obligaciones ADD COLUMN IF NOT EXISTS email_contacto TEXT;
ALTER TABLE obligaciones DROP COLUMN IF EXISTS status;

-- ============================================================================
-- B. CREAR TABLAS FALTANTES
-- ============================================================================

-- B1. user_products  (Panel Negocio - catálogo de productos/servicios)
CREATE TABLE IF NOT EXISTS user_products (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) DEFAULT 0,
  stock INT DEFAULT 0,
  category TEXT,
  business_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_products_user_id ON user_products(user_id);

-- B2. calendar_events  (Calendario inteligente)
CREATE TABLE IF NOT EXISTS calendar_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'reminder',
  start_date DATE,
  end_date DATE,
  all_day BOOLEAN DEFAULT false,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date);

-- ============================================================================
-- C. ROW LEVEL SECURITY  (RLS FORCE) + POLÍTICAS POR USUARIO
--    Cada usuario solo puede ver/modificar SUS propios datos.
-- ============================================================================

-- Tablas con propiedad por user_id
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'obligaciones','user_operations','user_inventory','user_goals',
    'user_goals_extra','user_leads','user_tasks','user_business_profiles',
    'user_products','calendar_events','calendario','movimientos','suscripciones'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_select', t);
    EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (auth.uid() = user_id)', t || '_select', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_insert', t);
    EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)', t || '_insert', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_update', t);
    EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t || '_update', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_delete', t);
    EXECUTE format('CREATE POLICY %I ON %I FOR DELETE USING (auth.uid() = user_id)', t || '_delete', t);
  END LOOP;
END $$;

-- C2. user_profiles  →  el id ES el auth.uid() del usuario
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "user_profiles_insert" ON user_profiles;
CREATE POLICY "user_profiles_insert" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "user_profiles_update" ON user_profiles;
CREATE POLICY "user_profiles_update" ON user_profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "user_profiles_delete" ON user_profiles;
CREATE POLICY "user_profiles_delete" ON user_profiles FOR DELETE USING (auth.uid() = id);

-- C3. profiles (legacy)  →  también por auth.uid() = id
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (auth.uid() = id);

-- C4. debt_reminders  →  solo el backend (service_role) accede; sin política pública
ALTER TABLE debt_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_reminders FORCE ROW LEVEL SECURITY;

-- C5. companies / company_members (multi-tenant legacy)  →  sin acceso público directo
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies FORCE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE companies FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE company_members FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- D. REVOCAR ACCESO PÚBLICO A LAS TABLAS DE DATOS
--    (solo 'authenticated' con políticas RLS puede operar)
-- ============================================================================
REVOKE ALL ON TABLE obligaciones           FROM PUBLIC, anon;
REVOKE ALL ON TABLE user_operations        FROM PUBLIC, anon;
REVOKE ALL ON TABLE user_inventory         FROM PUBLIC, anon;
REVOKE ALL ON TABLE user_goals             FROM PUBLIC, anon;
REVOKE ALL ON TABLE user_goals_extra       FROM PUBLIC, anon;
REVOKE ALL ON TABLE user_leads             FROM PUBLIC, anon;
REVOKE ALL ON TABLE user_tasks             FROM PUBLIC, anon;
REVOKE ALL ON TABLE user_business_profiles FROM PUBLIC, anon;
REVOKE ALL ON TABLE user_products          FROM PUBLIC, anon;
REVOKE ALL ON TABLE calendar_events        FROM PUBLIC, anon;
REVOKE ALL ON TABLE user_profiles          FROM PUBLIC, anon;
REVOKE ALL ON TABLE profiles               FROM PUBLIC, anon;
REVOKE ALL ON TABLE calendario             FROM PUBLIC, anon;
REVOKE ALL ON TABLE movimientos            FROM PUBLIC, anon;
REVOKE ALL ON TABLE suscripciones          FROM PUBLIC, anon;
REVOKE ALL ON TABLE debt_reminders         FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE obligaciones           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_operations        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_inventory         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_goals             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_goals_extra       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_leads             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_tasks             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_business_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_products          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE calendar_events        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_profiles          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profiles               TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE calendario             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE movimientos            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE suscripciones          TO authenticated;

-- ============================================================================
-- E. ÍNDICES DE RENDIMIENTO (por user_id)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_obligaciones_user_id    ON obligaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_obligaciones_estado     ON obligaciones(estado);
CREATE INDEX IF NOT EXISTS idx_user_operations_user    ON user_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_operations_created ON user_operations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user     ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user         ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_extra_user   ON user_goals_extra(user_id);
CREATE INDEX IF NOT EXISTS idx_user_leads_user         ON user_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_user         ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_biz_user           ON user_business_profiles(user_id);

-- ============================================================================
-- F. TRIGGERS de updated_at (para tablas que lo tienen)
-- ============================================================================
DROP TRIGGER IF EXISTS trg_obligaciones_updated ON obligaciones;
CREATE TRIGGER trg_obligaciones_updated BEFORE UPDATE ON obligaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_operations_updated ON user_operations;
CREATE TRIGGER trg_user_operations_updated BEFORE UPDATE ON user_operations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_inventory_updated ON user_inventory;
CREATE TRIGGER trg_user_inventory_updated BEFORE UPDATE ON user_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_leads_updated ON user_leads;
CREATE TRIGGER trg_user_leads_updated BEFORE UPDATE ON user_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_tasks_updated ON user_tasks;
CREATE TRIGGER trg_user_tasks_updated BEFORE UPDATE ON user_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_products_updated ON user_products;
CREATE TRIGGER trg_user_products_updated BEFORE UPDATE ON user_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_calendar_events_updated ON calendar_events;
CREATE TRIGGER trg_calendar_events_updated BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_profiles_updated ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- G. CONSTRAINTS DE INTEGRIDAD (nivel banco)
-- ============================================================================
ALTER TABLE user_operations DROP CONSTRAINT IF EXISTS user_operations_type_check;
ALTER TABLE user_operations
  ADD CONSTRAINT user_operations_type_check
  CHECK (type IN ('ingreso','egreso','income','expense')) NOT VALID;

ALTER TABLE obligaciones DROP CONSTRAINT IF EXISTS obligaciones_estado_check;
ALTER TABLE obligaciones
  ADD CONSTRAINT obligaciones_estado_check
  CHECK (estado IN ('pendiente','pagada','pagado','vencida')) NOT VALID;

-- ============================================================================
-- H. LIMPIEZA OPCIONAL DE TABLAS LEGACY (descomentar para eliminar)
--    Ya NO se usan en el código actual: suscripciones, calendario, companies,
--    profiles, movimientos, company_members. Están bloqueadas (sin acceso
--    público) por seguridad. Si confirmas que no las necesitas, descomenta:
-- ============================================================================
-- DROP TABLE IF EXISTS suscripciones CASCADE;
-- DROP TABLE IF EXISTS calendario CASCADE;
-- DROP TABLE IF EXISTS companies CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TABLE IF EXISTS movimientos CASCADE;
-- DROP TABLE IF EXISTS company_members CASCADE;

-- ============================================================================
-- ¡LISTO! Base de datos alineada, ordenada y con RLS nivel banco mundial.
-- ============================================================================

