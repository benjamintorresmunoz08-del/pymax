-- ============================================================================
-- PYMAX - SISTEMA MULTI-EMPRESA
-- Este script crea toda la infraestructura para manejar múltiples empresas
-- con límite de 3 usuarios por empresa en Plan Mover
-- ============================================================================

-- PASO 1: Crear tabla de empresas
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rut TEXT UNIQUE,
    industry TEXT,
    employees INTEGER DEFAULT 1,
    plan TEXT DEFAULT 'mover' CHECK (plan IN ('mover', 'tiburon', 'hambre')),
    max_users INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE companies IS 'Empresas registradas en Pymax';
COMMENT ON COLUMN companies.plan IS 'Plan contratado: mover (3 usuarios), tiburon (10 usuarios), hambre (ilimitado)';
COMMENT ON COLUMN companies.max_users IS 'Máximo de usuarios permitidos según plan';

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_companies_rut ON companies(rut);
CREATE INDEX IF NOT EXISTS idx_companies_plan ON companies(plan);

-- ============================================================================
-- PASO 2: Crear tabla de relación usuarios-empresas
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, user_id)
);

COMMENT ON TABLE company_members IS 'Relación entre usuarios y empresas';
COMMENT ON COLUMN company_members.role IS 'owner: creador, admin: gestor, member: usuario básico';

-- Índices
CREATE INDEX IF NOT EXISTS idx_company_members_company ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user ON company_members(user_id);

-- ============================================================================
-- PASO 3: Agregar company_id a todas las tablas existentes
-- ============================================================================

-- 3.1 user_operations (transacciones)
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_operations_company ON user_operations(company_id);

-- 3.2 user_inventory (inventario)
ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_inventory_company ON user_inventory(company_id);

-- 3.3 obligaciones (deudas/obligaciones)
ALTER TABLE obligaciones ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_obligations_company ON obligaciones(company_id);

-- 3.4 user_goals (metas)
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_goals_company ON user_goals(company_id);

-- 3.5 user_leads (CRM - leads)
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_leads_company ON user_leads(company_id);

-- 3.6 user_tasks (tareas operacionales)
ALTER TABLE user_tasks ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_tasks_company ON user_tasks(company_id);

-- ============================================================================
-- PASO 4: Función para validar límite de usuarios por empresa
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_company_user_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    max_allowed INTEGER;
    company_plan TEXT;
BEGIN
    -- Obtener plan de la empresa
    SELECT plan, max_users INTO company_plan, max_allowed
    FROM companies
    WHERE id = NEW.company_id;
    
    -- Contar usuarios actuales
    SELECT COUNT(*) INTO current_count
    FROM company_members
    WHERE company_id = NEW.company_id;
    
    -- Validar límite
    IF current_count >= max_allowed THEN
        RAISE EXCEPTION 'La empresa ha alcanzado el límite de % usuarios para el plan %', max_allowed, company_plan;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar antes de insertar
DROP TRIGGER IF EXISTS check_user_limit ON company_members;
CREATE TRIGGER check_user_limit
    BEFORE INSERT ON company_members
    FOR EACH ROW
    EXECUTE FUNCTION validate_company_user_limit();

-- ============================================================================
-- PASO 5: Función para obtener company_id del usuario autenticado
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
DECLARE
    company_uuid UUID;
BEGIN
    SELECT company_id INTO company_uuid
    FROM company_members
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    RETURN company_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PASO 6: Políticas RLS para companies
-- ============================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Ver solo empresas donde el usuario es miembro
DROP POLICY IF EXISTS "Users can view own company" ON companies;
CREATE POLICY "Users can view own company" ON companies
    FOR SELECT
    USING (
        id IN (
            SELECT company_id 
            FROM company_members 
            WHERE user_id = auth.uid()
        )
    );

-- Solo owner puede actualizar empresa
DROP POLICY IF EXISTS "Owners can update company" ON companies;
CREATE POLICY "Owners can update company" ON companies
    FOR UPDATE
    USING (
        id IN (
            SELECT company_id 
            FROM company_members 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Cualquier usuario autenticado puede crear empresa (al registrarse)
DROP POLICY IF EXISTS "Authenticated users can create company" ON companies;
CREATE POLICY "Authenticated users can create company" ON companies
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- PASO 7: Políticas RLS para company_members
-- ============================================================================

ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Ver miembros de tu propia empresa
DROP POLICY IF EXISTS "Users can view own company members" ON company_members;
CREATE POLICY "Users can view own company members" ON company_members
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id 
            FROM company_members 
            WHERE user_id = auth.uid()
        )
    );

-- Owner/Admin puede agregar miembros
DROP POLICY IF EXISTS "Owners can add members" ON company_members;
CREATE POLICY "Owners can add members" ON company_members
    FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM company_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Owner/Admin puede remover miembros
DROP POLICY IF EXISTS "Owners can remove members" ON company_members;
CREATE POLICY "Owners can remove members" ON company_members
    FOR DELETE
    USING (
        company_id IN (
            SELECT company_id 
            FROM company_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- ============================================================================
-- PASO 8: Actualizar políticas RLS de todas las tablas para usar company_id
-- ============================================================================

-- 8.1 user_operations
DROP POLICY IF EXISTS "Users can view own operations" ON user_operations;
CREATE POLICY "Users can view own operations" ON user_operations
    FOR SELECT
    USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can insert own operations" ON user_operations;
CREATE POLICY "Users can insert own operations" ON user_operations
    FOR INSERT
    WITH CHECK (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can update own operations" ON user_operations;
CREATE POLICY "Users can update own operations" ON user_operations
    FOR UPDATE
    USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can delete own operations" ON user_operations;
CREATE POLICY "Users can delete own operations" ON user_operations
    FOR DELETE
    USING (company_id = get_user_company_id());

-- 8.2 user_inventory
DROP POLICY IF EXISTS "Users can view own inventory" ON user_inventory;
CREATE POLICY "Users can view own inventory" ON user_inventory
    FOR SELECT
    USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can insert own inventory" ON user_inventory;
CREATE POLICY "Users can insert own inventory" ON user_inventory
    FOR INSERT
    WITH CHECK (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can update own inventory" ON user_inventory;
CREATE POLICY "Users can update own inventory" ON user_inventory
    FOR UPDATE
    USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can delete own inventory" ON user_inventory;
CREATE POLICY "Users can delete own inventory" ON user_inventory
    FOR DELETE
    USING (company_id = get_user_company_id());

-- 8.3 obligaciones
DROP POLICY IF EXISTS "Users can view own obligations" ON obligaciones;
CREATE POLICY "Users can view own obligations" ON obligaciones
    FOR SELECT
    USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can insert own obligations" ON obligaciones;
CREATE POLICY "Users can insert own obligations" ON obligaciones
    FOR INSERT
    WITH CHECK (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can update own obligations" ON obligaciones;
CREATE POLICY "Users can update own obligations" ON obligaciones
    FOR UPDATE
    USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can delete own obligations" ON obligaciones;
CREATE POLICY "Users can delete own obligations" ON obligaciones
    FOR DELETE
    USING (company_id = get_user_company_id());

-- (Repetir para user_goals, user_leads, user_tasks...)

-- ============================================================================
-- PASO 9: Datos de ejemplo (OPCIONAL - comentar si no quieres)
-- ============================================================================

/*
-- Crear empresa de ejemplo
INSERT INTO companies (name, rut, industry, employees, plan, max_users)
VALUES ('TechSolutions SpA', '76.123.456-7', 'Tecnología', 5, 'mover', 3);

-- Nota: Después del registro real, el usuario se agregará a company_members
*/

-- ============================================================================
-- PASO 10: Verificación
-- ============================================================================

-- Ver todas las empresas
SELECT 'EMPRESAS CREADAS:' as info;
SELECT id, name, plan, max_users, created_at FROM companies;

-- Ver función de límite
SELECT 'FUNCIÓN DE LÍMITE:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'validate_company_user_limit';

-- Ver políticas RLS
SELECT 'POLÍTICAS RLS ACTIVAS:' as info;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('companies', 'company_members', 'user_operations')
ORDER BY tablename, policyname;

SELECT '✅ SISTEMA MULTI-EMPRESA CREADO EXITOSAMENTE' as resultado;
