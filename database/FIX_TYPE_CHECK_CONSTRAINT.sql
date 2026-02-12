-- =====================================================
-- PYMAX - FIX CONSTRAINT TYPE CHECK (SOLUCIÓN DEFINITIVA)
-- =====================================================
-- El problema: La restricción CHECK solo acepta 'income'/'expense'
-- pero el frontend envía 'ingreso'/'egreso'
-- =====================================================

-- PASO 1: Ver qué constraints existen actualmente
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'user_operations'::regclass
AND contype = 'c'; -- CHECK constraints

-- PASO 2: Eliminar TODOS los constraints de tipo CHECK
ALTER TABLE user_operations DROP CONSTRAINT IF EXISTS user_operations_type_check;
ALTER TABLE user_operations DROP CONSTRAINT IF EXISTS user_operations_new_type_check;
ALTER TABLE user_operations DROP CONSTRAINT IF EXISTS user_operations_amount_check;
ALTER TABLE user_operations DROP CONSTRAINT IF EXISTS user_operations_new_amount_check;

-- PASO 3: Crear constraints correctos que acepten AMBOS formatos
ALTER TABLE user_operations 
ADD CONSTRAINT user_operations_type_check 
CHECK (type IN ('income', 'expense', 'ingreso', 'egreso'));

ALTER TABLE user_operations 
ADD CONSTRAINT user_operations_amount_check 
CHECK (amount > 0);

-- PASO 4: Verificar que los constraints están correctos
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'user_operations'::regclass
AND contype = 'c'
ORDER BY conname;

SELECT '✅ Constraints corregidos - Ahora acepta ingreso/egreso' as status;
