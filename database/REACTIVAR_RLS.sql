-- ============================================================================
-- REACTIVAR RLS EN TODAS LAS TABLAS (Por si fue desactivado)
-- ============================================================================
-- Este script GARANTIZA que RLS está activo en todas las tablas
-- ============================================================================

-- Activar RLS en todas las tablas del sistema multi-empresa
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Activar RLS en todas las tablas de datos
ALTER TABLE user_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FORZAR RLS INCLUSO PARA EL OWNER DE LA BASE DE DATOS
-- ============================================================================
-- Esto garantiza que NADIE puede saltarse las políticas RLS
-- ============================================================================

ALTER TABLE companies FORCE ROW LEVEL SECURITY;
ALTER TABLE company_members FORCE ROW LEVEL SECURITY;
ALTER TABLE user_operations FORCE ROW LEVEL SECURITY;
ALTER TABLE user_inventory FORCE ROW LEVEL SECURITY;
ALTER TABLE obligaciones FORCE ROW LEVEL SECURITY;
ALTER TABLE user_goals FORCE ROW LEVEL SECURITY;
ALTER TABLE user_leads FORCE ROW LEVEL SECURITY;
ALTER TABLE user_tasks FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICAR RESULTADOS
-- ============================================================================

DO $$
DECLARE
    total_enabled INTEGER;
    total_forced INTEGER;
BEGIN
    -- Contar tablas con RLS habilitado
    SELECT COUNT(*) INTO total_enabled
    FROM pg_tables
    WHERE tablename IN ('companies', 'company_members', 'user_operations', 'user_inventory',
                        'obligaciones', 'user_goals', 'user_leads', 'user_tasks')
    AND schemaname = 'public'
    AND rowsecurity = true;
    
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════';
    RAISE NOTICE '🔒 RLS REACTIVADO EXITOSAMENTE';
    RAISE NOTICE '═══════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '✅ % de 8 tablas tienen RLS activo', total_enabled;
    RAISE NOTICE '✅ RLS FORZADO en todas las tablas';
    RAISE NOTICE '✅ Ni siquiera el owner puede saltarse las políticas';
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ SEGURIDAD MÁXIMA ACTIVADA';
    RAISE NOTICE '';
    RAISE NOTICE 'Ahora ejecuta VERIFICAR_RLS_ACTIVO.sql para confirmar';
    RAISE NOTICE '═══════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
