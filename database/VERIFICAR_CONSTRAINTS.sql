-- =====================================================
-- PYMAX - VERIFICAR CONSTRAINTS DE USER_OPERATIONS
-- =====================================================
-- Este script te muestra EXACTAMENTE qué constraints
-- tiene la tabla y qué valores aceptan
-- =====================================================

-- Ver TODOS los constraints de user_operations
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'user_operations'::regclass
ORDER BY conname;

-- Ver estructura completa de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_operations'
ORDER BY ordinal_position;

-- Probar si podemos insertar 'ingreso'
DO $$
BEGIN
    -- Intentar insertar un registro de prueba con 'ingreso'
    INSERT INTO user_operations (user_id, type, amount, concept, date)
    VALUES (
        gen_random_uuid(),
        'ingreso',
        100.00,
        'Prueba de constraint',
        CURRENT_DATE
    );
    
    -- Si llegamos aquí, funcionó - eliminar el registro de prueba
    DELETE FROM user_operations WHERE concept = 'Prueba de constraint';
    
    RAISE NOTICE '✅ El constraint ACEPTA "ingreso" correctamente';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE '❌ ERROR: El constraint NO acepta "ingreso"';
        RAISE NOTICE 'Mensaje: %', SQLERRM;
    WHEN others THEN
        RAISE NOTICE '⚠️ Otro error: %', SQLERRM;
END $$;

-- Mostrar resumen
SELECT 
    'user_operations' as tabla,
    COUNT(*) as total_constraints
FROM pg_constraint c
WHERE conrelid = 'user_operations'::regclass;
