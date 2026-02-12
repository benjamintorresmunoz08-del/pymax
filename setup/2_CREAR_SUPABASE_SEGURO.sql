-- ============================================================
-- 🔐 PYMAX - BASE DE DATOS NIVEL BANCARIO
-- ============================================================
-- SEGURIDAD MÁXIMA: Cada usuario en su bunker. Sin fugas.
-- ============================================================

-- ============================================================
-- SECCIÓN 1: FUNCIONES DE UTILIDAD
-- ============================================================

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SECCIÓN 2: TABLAS (Con validaciones y constraints)
-- ============================================================

-- TABLA 1: PERFILES DE USUARIO
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL CHECK (LENGTH(full_name) >= 2),
    account_type TEXT CHECK (account_type IN ('empresa', 'personal')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraint: email único (opcional - Supabase ya lo maneja en auth.users)
    CONSTRAINT valid_account_type CHECK (account_type IS NULL OR account_type IN ('empresa', 'personal'))
);

-- TABLA 2: OPERACIONES FINANCIERAS
CREATE TABLE user_operations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Datos de la operación
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    concept TEXT NOT NULL CHECK (LENGTH(concept) >= 3),
    type TEXT NOT NULL CHECK (type IN ('ingreso', 'egreso')),
    category TEXT,
    
    -- Análisis financiero detallado
    cost_amount NUMERIC(12,2) DEFAULT 0 CHECK (cost_amount >= 0),
    tax_amount NUMERIC(12,2) DEFAULT 0 CHECK (tax_amount >= 0),
    net_profit NUMERIC(12,2) DEFAULT 0,
    counterparty TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Índice para búsqueda rápida por usuario
    CONSTRAINT fk_user_operations_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- TABLA 3: OBLIGACIONES (Deudas y compromisos)
CREATE TABLE obligaciones (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    tipo TEXT NOT NULL CHECK (LENGTH(tipo) >= 2),
    monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    fecha_pago DATE NOT NULL,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'vencida')),
    email_contacto TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT fk_obligaciones_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- TABLA 4: METAS PRINCIPALES (1 por usuario)
CREATE TABLE user_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    goal_text TEXT NOT NULL CHECK (LENGTH(goal_text) >= 5),
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT fk_user_goals_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- TABLA 5: METAS ADICIONALES (hasta 2 extras por usuario = slots 2 y 3)
CREATE TABLE user_goals_extra (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    slot_number INT NOT NULL CHECK (slot_number IN (2, 3)),
    goal_text TEXT NOT NULL CHECK (LENGTH(goal_text) >= 5),
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Un usuario no puede tener dos metas en el mismo slot
    CONSTRAINT unique_user_slot UNIQUE (user_id, slot_number),
    CONSTRAINT fk_user_goals_extra_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- TABLA 6: INVENTARIO
CREATE TABLE user_inventory (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    product_name TEXT NOT NULL CHECK (LENGTH(product_name) >= 2),
    current_stock INT DEFAULT 0 CHECK (current_stock >= 0),
    
    -- Datos económicos
    cost_price NUMERIC(12,2) DEFAULT 0 CHECK (cost_price >= 0),
    sale_price NUMERIC(12,2) DEFAULT 0 CHECK (sale_price >= 0),
    tax_percent NUMERIC(5,2) DEFAULT 0 CHECK (tax_percent >= 0 AND tax_percent <= 100),
    supplier TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT fk_user_inventory_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================
-- SECCIÓN 3: ÍNDICES (Para velocidad extrema)
-- ============================================================

CREATE INDEX idx_user_operations_user_id ON user_operations(user_id);
CREATE INDEX idx_user_operations_created_at ON user_operations(created_at DESC);
CREATE INDEX idx_user_operations_type ON user_operations(type);

CREATE INDEX idx_obligaciones_user_id ON obligaciones(user_id);
CREATE INDEX idx_obligaciones_fecha_pago ON obligaciones(fecha_pago);
CREATE INDEX idx_obligaciones_estado ON obligaciones(estado);

CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);

-- ============================================================
-- SECCIÓN 4: TRIGGERS (Automatización)
-- ============================================================

-- Trigger para user_profiles (auto-actualizar updated_at)
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_goals (auto-actualizar updated_at)
CREATE TRIGGER update_user_goals_updated_at
    BEFORE UPDATE ON user_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SECCIÓN 5: ROW LEVEL SECURITY (RLS) - BUNKER MÁXIMO
-- ============================================================

-- Activar RLS en TODAS las tablas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS: USER_PROFILES
-- ============================================================

CREATE POLICY "user_profiles_select" 
ON user_profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "user_profiles_insert" 
ON user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update" 
ON user_profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- No DELETE policy (los perfiles no se borran; se borra el usuario en auth y CASCADE lo elimina)

-- ============================================================
-- POLÍTICAS: USER_OPERATIONS
-- ============================================================

CREATE POLICY "user_operations_select" 
ON user_operations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "user_operations_insert" 
ON user_operations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_operations_update" 
ON user_operations 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_operations_delete" 
ON user_operations 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================================
-- POLÍTICAS: OBLIGACIONES
-- ============================================================

CREATE POLICY "obligaciones_select" 
ON obligaciones 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "obligaciones_insert" 
ON obligaciones 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "obligaciones_update" 
ON obligaciones 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "obligaciones_delete" 
ON obligaciones 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================================
-- POLÍTICAS: USER_GOALS
-- ============================================================

CREATE POLICY "user_goals_select" 
ON user_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "user_goals_insert" 
ON user_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_goals_update" 
ON user_goals 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_goals_delete" 
ON user_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================================
-- POLÍTICAS: USER_GOALS_EXTRA
-- ============================================================

CREATE POLICY "user_goals_extra_select" 
ON user_goals_extra 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "user_goals_extra_insert" 
ON user_goals_extra 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_goals_extra_update" 
ON user_goals_extra 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_goals_extra_delete" 
ON user_goals_extra 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================================
-- POLÍTICAS: USER_INVENTORY
-- ============================================================

CREATE POLICY "user_inventory_select" 
ON user_inventory 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "user_inventory_insert" 
ON user_inventory 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_inventory_update" 
ON user_inventory 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_inventory_delete" 
ON user_inventory 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================================
-- ✅ BASE DE DATOS CONFIGURADA - SEGURIDAD MÁXIMA ACTIVADA
-- ============================================================
-- Cada usuario está en su búnker.
-- Ningún usuario puede ver datos de otros.
-- Todas las consultas validan auth.uid() automáticamente.
-- ============================================================
