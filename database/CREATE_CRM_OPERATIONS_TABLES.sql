-- =====================================================
-- TABLAS PARA TIBURÓN (CRM) Y HAMBRE (OPERATIONS)
-- 100% Funcional con RLS y datos reales
-- =====================================================

BEGIN;

-- =====================================================
-- TABLA: user_leads (CRM - Tiburón)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    position TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
    value NUMERIC(12, 2) DEFAULT 0,
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    source TEXT,
    notes TEXT,
    next_action TEXT,
    next_action_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_leads_user_id ON user_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_leads_status ON user_leads(status);
CREATE INDEX IF NOT EXISTS idx_user_leads_created_at ON user_leads(created_at DESC);

-- RLS
ALTER TABLE user_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_leads_select_own ON user_leads;
CREATE POLICY user_leads_select_own ON user_leads
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_leads_insert_own ON user_leads;
CREATE POLICY user_leads_insert_own ON user_leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_leads_update_own ON user_leads;
CREATE POLICY user_leads_update_own ON user_leads
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_leads_delete_own ON user_leads;
CREATE POLICY user_leads_delete_own ON user_leads
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_user_leads_updated_at ON user_leads;
CREATE TRIGGER update_user_leads_updated_at
    BEFORE UPDATE ON user_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLA: user_tasks (Operations - Hambre)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to TEXT,
    category TEXT,
    due_date DATE,
    estimated_hours NUMERIC(5, 2),
    actual_hours NUMERIC(5, 2),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON user_tasks(status);
CREATE INDEX IF NOT EXISTS idx_user_tasks_priority ON user_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_user_tasks_due_date ON user_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_user_tasks_created_at ON user_tasks(created_at DESC);

-- RLS
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_tasks_select_own ON user_tasks;
CREATE POLICY user_tasks_select_own ON user_tasks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_tasks_insert_own ON user_tasks;
CREATE POLICY user_tasks_insert_own ON user_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_tasks_update_own ON user_tasks;
CREATE POLICY user_tasks_update_own ON user_tasks
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_tasks_delete_own ON user_tasks;
CREATE POLICY user_tasks_delete_own ON user_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_user_tasks_updated_at ON user_tasks;
CREATE TRIGGER update_user_tasks_updated_at
    BEFORE UPDATE ON user_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 'user_leads table created successfully' AS message;
SELECT 'user_tasks table created successfully' AS message;
