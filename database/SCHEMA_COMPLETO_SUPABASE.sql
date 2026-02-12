-- =====================================================
-- PYMAX - ESQUEMA COMPLETO DE BASE DE DATOS
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. ELIMINAR TABLAS EXISTENTES (CUIDADO: Borra todos los datos)
DROP TABLE IF EXISTS user_inventory CASCADE;
DROP TABLE IF EXISTS user_operations CASCADE;
DROP TABLE IF EXISTS user_goals_extra CASCADE;
DROP TABLE IF EXISTS user_goals CASCADE;
DROP TABLE IF EXISTS obligaciones CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- =====================================================
-- 2. CREAR TABLAS CON ESTRUCTURA COMPLETA
-- =====================================================

-- Tabla: obligaciones (Deudas y obligaciones)
CREATE TABLE obligaciones (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    monto NUMERIC(10, 2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    email_contacto VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: user_goals (Meta principal del usuario)
CREATE TABLE user_goals (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    goal_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: user_goals_extra (Metas adicionales 2 y 3)
CREATE TABLE user_goals_extra (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    slot_number INTEGER NOT NULL, -- 2 o 3
    goal_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: user_operations (Transacciones: ingresos y gastos)
CREATE TABLE user_operations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    concept VARCHAR(200),
    type VARCHAR(50), -- 'ingreso' o 'gasto'
    category VARCHAR(50),
    
    -- COLUMNAS NUEVAS (Inteligencia Financiera)
    cost_amount NUMERIC(10, 2) DEFAULT 0,
    tax_amount NUMERIC(10, 2) DEFAULT 0,
    net_profit NUMERIC(10, 2) DEFAULT 0,
    counterparty VARCHAR(150),
    metadata JSONB DEFAULT '{}', -- Para datos adicionales flexibles
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: user_inventory (Inventario/Stock)
CREATE TABLE user_inventory (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    current_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    
    -- COLUMNAS NUEVAS (Economía Unitaria)
    cost_price NUMERIC(10, 2) DEFAULT 0,
    sale_price NUMERIC(10, 2) DEFAULT 0,
    tax_percent NUMERIC(5, 2) DEFAULT 0,
    supplier VARCHAR(150),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    description TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: user_profiles (Perfiles y preferencias)
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(150),
    company_name VARCHAR(150),
    
    -- Preferencias
    preferred_currency VARCHAR(10) DEFAULT 'USD',
    preferred_language VARCHAR(10) DEFAULT 'es',
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Metadata adicional
    settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. CREAR ÍNDICES PARA RENDIMIENTO
-- =====================================================

CREATE INDEX idx_obligaciones_user ON obligaciones(user_id);
CREATE INDEX idx_obligaciones_estado ON obligaciones(estado);
CREATE INDEX idx_operations_user ON user_operations(user_id);
CREATE INDEX idx_operations_type ON user_operations(type);
CREATE INDEX idx_operations_date ON user_operations(created_at);
CREATE INDEX idx_inventory_user ON user_inventory(user_id);
CREATE INDEX idx_inventory_stock ON user_inventory(current_stock);
CREATE INDEX idx_profiles_user ON user_profiles(user_id);

-- =====================================================
-- 4. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE obligaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Obligaciones: Solo el dueño puede ver/editar
CREATE POLICY "Users can view their own obligations" ON obligaciones
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own obligations" ON obligaciones
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own obligations" ON obligaciones
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own obligations" ON obligaciones
    FOR DELETE USING (auth.uid()::text = user_id);

-- Operaciones: Solo el dueño puede ver/editar
CREATE POLICY "Users can view their own operations" ON user_operations
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own operations" ON user_operations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own operations" ON user_operations
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own operations" ON user_operations
    FOR DELETE USING (auth.uid()::text = user_id);

-- Inventario: Solo el dueño puede ver/editar
CREATE POLICY "Users can view their own inventory" ON user_inventory
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own inventory" ON user_inventory
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own inventory" ON user_inventory
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own inventory" ON user_inventory
    FOR DELETE USING (auth.uid()::text = user_id);

-- Metas: Solo el dueño puede ver/editar
CREATE POLICY "Users can view their own goals" ON user_goals
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own goals" ON user_goals
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own goals" ON user_goals
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own goals" ON user_goals
    FOR DELETE USING (auth.uid()::text = user_id);

-- Metas Extra
CREATE POLICY "Users can view their own extra goals" ON user_goals_extra
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own extra goals" ON user_goals_extra
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own extra goals" ON user_goals_extra
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own extra goals" ON user_goals_extra
    FOR DELETE USING (auth.uid()::text = user_id);

-- Perfiles: Solo el dueño puede ver/editar
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

-- =====================================================
-- 6. FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_obligaciones_updated_at BEFORE UPDATE ON obligaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operations_updated_at BEFORE UPDATE ON user_operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON user_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. DATOS DE PRUEBA (OPCIONAL - Para desarrollo)
-- =====================================================

-- Insertar usuario demo (usar el ID real de tu usuario Supabase)
-- Reemplaza 'TU-USER-ID' con el ID real de auth.users

-- INSERT INTO user_profiles (user_id, full_name, company_name) VALUES
-- ('TU-USER-ID', 'Demo User', 'Demo Company');

-- INSERT INTO user_operations (user_id, amount, concept, type, category) VALUES
-- ('TU-USER-ID', 5000, 'Venta de productos', 'ingreso', 'Product Sales'),
-- ('TU-USER-ID', 2000, 'Renta de oficina', 'gasto', 'Rent/Lease'),
-- ('TU-USER-ID', 1500, 'Salarios', 'gasto', 'Salaries/Wages');

-- INSERT INTO user_inventory (user_id, product_name, current_stock, cost_price, sale_price) VALUES
-- ('TU-USER-ID', 'Laptop Dell XPS', 15, 800, 1200),
-- ('TU-USER-ID', 'Mouse Logitech MX', 50, 40, 70);

-- =====================================================
-- COMPLETADO
-- =====================================================

-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar políticas RLS
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';
