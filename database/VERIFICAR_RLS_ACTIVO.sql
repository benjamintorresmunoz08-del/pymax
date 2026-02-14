-- ============================================================================
-- VERIFICAR QUE RLS ESTÁ ACTIVO Y CONFIGURADO CORRECTAMENTE
-- ============================================================================

-- 1. Verificar que RLS está habilitado en las tablas
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS ACTIVO'
        ELSE '❌ RLS DESACTIVADO'
    END as estado_rls
FROM pg_tables
WHERE tablename IN ('companies', 'company_members', 'user_operations', 'user_inventory', 
                    'obligaciones', 'user_goals', 'user_leads', 'user_tasks')
AND schemaname = 'public'
ORDER BY tablename;

-- 2. Ver todas las políticas RLS activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operacion,
    CASE 
        WHEN cmd = 'SELECT' THEN '🔍 Lectura'
        WHEN cmd = 'INSERT' THEN '➕ Inserción'
        WHEN cmd = 'UPDATE' THEN '✏️ Actualización'
        WHEN cmd = 'DELETE' THEN '🗑️ Eliminación'
        ELSE cmd
    END as tipo_operacion
FROM pg_policies
WHERE tablename IN ('companies', 'company_members', 'user_operations', 'user_inventory',
                    'obligaciones', 'user_goals', 'user_leads', 'user_tasks')
ORDER BY tablename, cmd, policyname;

-- 3. Contar políticas por tabla
SELECT 
    tablename,
    COUNT(*) as total_politicas,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as lectura,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insercion,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as actualizacion,
    COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as eliminacion
FROM pg_policies
WHERE tablename IN ('companies', 'company_members', 'user_operations', 'user_inventory',
                    'obligaciones', 'user_goals', 'user_leads', 'user_tasks')
GROUP BY tablename
ORDER BY tablename;

-- 4. Verificar función de seguridad
SELECT 
    routine_name,
    CASE 
        WHEN routine_name IN ('get_user_company_id') THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as estado
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_user_company_id';

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Si todo está bien, deberías ver:
-- 1. Todas las tablas con "✅ RLS ACTIVO"
-- 2. Múltiples políticas para cada tabla
-- 3. La función get_user_company_id existe
-- 4. Total de políticas: ~24 (aproximadamente 3-4 por tabla)
-- ============================================================================

DO $$
DECLARE
    total_rls_enabled INTEGER;
    total_policies INTEGER;
BEGIN
    -- Contar tablas con RLS activo
    SELECT COUNT(*) INTO total_rls_enabled
    FROM pg_tables
    WHERE tablename IN ('companies', 'company_members', 'user_operations', 'user_inventory',
                        'obligaciones', 'user_goals', 'user_leads', 'user_tasks')
    AND schemaname = 'public'
    AND rowsecurity = true;
    
    -- Contar políticas totales
    SELECT COUNT(*) INTO total_policies
    FROM pg_policies
    WHERE tablename IN ('companies', 'company_members', 'user_operations', 'user_inventory',
                        'obligaciones', 'user_goals', 'user_leads', 'user_tasks');
    
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════';
    RAISE NOTICE '🔒 RESUMEN DE SEGURIDAD RLS';
    RAISE NOTICE '═══════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tablas con RLS activo: % de 8', total_rls_enabled;
    RAISE NOTICE '🛡️ Políticas totales: %', total_policies;
    RAISE NOTICE '';
    
    IF total_rls_enabled = 8 AND total_policies >= 20 THEN
        RAISE NOTICE '✅ SEGURIDAD ÓPTIMA';
        RAISE NOTICE '✅ Todas las tablas tienen RLS activo';
        RAISE NOTICE '✅ Políticas configuradas correctamente';
    ELSE
        RAISE NOTICE '⚠️ CONFIGURACIÓN INCOMPLETA';
        IF total_rls_enabled < 8 THEN
            RAISE NOTICE '❌ Faltan tablas con RLS activo';
        END IF;
        IF total_policies < 20 THEN
            RAISE NOTICE '❌ Faltan políticas de seguridad';
        END IF;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════';
END $$;
