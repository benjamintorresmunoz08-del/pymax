-- =====================================================
-- PASO 1: VERIFICAR TIPOS DE DATOS DE LAS COLUMNAS
-- =====================================================

-- Este script te dirá EXACTAMENTE qué tipo de datos tiene user_id en cada tabla

SELECT 
    table_name,
    column_name,
    data_type,
    udt_name,
    CASE 
        WHEN data_type = 'uuid' THEN '✅ UUID - Usar: auth.uid() = user_id'
        WHEN data_type = 'character varying' OR data_type = 'text' THEN '✅ TEXT - Usar: auth.uid()::text = user_id'
        WHEN data_type = 'integer' OR data_type = 'bigint' THEN '❌ INTEGER - ERROR: No se puede usar auth.uid() directamente'
        ELSE '⚠️ DESCONOCIDO: ' || data_type
    END as recomendacion
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('user_operations', 'user_inventory', 'obligaciones', 'user_goals', 'user_goals_extra', 'user_profiles')
AND column_name IN ('user_id', 'id')
ORDER BY table_name, column_name;

-- =====================================================
-- INSTRUCCIONES:
-- =====================================================
-- 1. Ejecuta SOLO este script en Supabase
-- 2. Copia el resultado COMPLETO
-- 3. Envíamelo para que pueda crear las políticas correctas
-- 4. NO ejecutes nada más hasta que vea los resultados
-- =====================================================
