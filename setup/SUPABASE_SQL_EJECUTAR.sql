-- ============================================================
-- PYMAX - SCRIPT PARA SUPABASE
-- ============================================================
-- CÓMO USAR: Copia TODO este archivo y pégalo en Supabase > SQL Editor > New Query
-- Luego haz clic en "Run" (ejecutar)
-- ============================================================

-- 1. TABLA OBLIGACIONES (deudas)
CREATE TABLE IF NOT EXISTS obligaciones (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha_pago DATE NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  email_contacto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA OPERACIONES (ingresos y gastos)
CREATE TABLE IF NOT EXISTS user_operations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  concept TEXT,
  type TEXT NOT NULL,
  category TEXT,
  cost_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  net_profit DECIMAL(10,2) DEFAULT 0,
  counterparty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA METAS PRINCIPAL
CREATE TABLE IF NOT EXISTS user_goals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  goal_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA METAS ADICIONALES
CREATE TABLE IF NOT EXISTS user_goals_extra (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slot_number INT NOT NULL,
  goal_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA INVENTARIO
CREATE TABLE IF NOT EXISTS user_inventory (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  current_stock INT DEFAULT 0,
  cost_price DECIMAL(10,2) DEFAULT 0,
  sale_price DECIMAL(10,2) DEFAULT 0,
  tax_percent DECIMAL(5,2) DEFAULT 0,
  supplier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA PERFILES (para elegir empresa/personal)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  account_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Cada usuario solo ve sus datos
-- ============================================================

ALTER TABLE obligaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para obligaciones
DROP POLICY IF EXISTS "Usuarios ven sus obligaciones" ON obligaciones;
CREATE POLICY "Usuarios ven sus obligaciones" ON obligaciones FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_operations
DROP POLICY IF EXISTS "Usuarios ven sus operaciones" ON user_operations;
CREATE POLICY "Usuarios ven sus operaciones" ON user_operations FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_goals
DROP POLICY IF EXISTS "Usuarios ven sus metas" ON user_goals;
CREATE POLICY "Usuarios ven sus metas" ON user_goals FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_goals_extra
DROP POLICY IF EXISTS "Usuarios ven sus metas extra" ON user_goals_extra;
CREATE POLICY "Usuarios ven sus metas extra" ON user_goals_extra FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_inventory
DROP POLICY IF EXISTS "Usuarios ven su inventario" ON user_inventory;
CREATE POLICY "Usuarios ven su inventario" ON user_inventory FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_profiles
DROP POLICY IF EXISTS "Usuarios ven su perfil" ON user_profiles;
CREATE POLICY "Usuarios ven su perfil" ON user_profiles FOR ALL USING (auth.uid() = id);
-- ============================================================
-- ¡LISTO! Tus tablas están creadas y seguras.
-- ============================================================
