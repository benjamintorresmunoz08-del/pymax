-- ============================================================
-- PYMAX · FLUJO DE CAJA PROFESIONAL
-- Columnas opcionales para habilitar las funciones avanzadas
-- del panel de flujo de caja:
--   1) activity_type → clasificación en 3 pilares
--      (operativo / inversion / financiamiento)
--   2) status        → realizado vs proyectado/pendiente
--   3) due_date      → fecha de vencimiento (para proyección)
--   4) currency      → moneda por transacción (multimoneda)
-- ============================================================
-- Ejecutar en Supabase → SQL Editor → New Query → Run.
-- Es idempotente (puede ejecutarse más de una vez sin error).
-- ============================================================

ALTER TABLE user_operations
  ADD COLUMN IF NOT EXISTS activity_type TEXT DEFAULT 'operativo',
  ADD COLUMN IF NOT EXISTS status        TEXT DEFAULT 'realizado',
  ADD COLUMN IF NOT EXISTS due_date      DATE,
  ADD COLUMN IF NOT EXISTS currency      TEXT DEFAULT 'CLP';

-- Restricciones de integridad (solo si no existen)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_operations_activity_type_check'
  ) THEN
    ALTER TABLE user_operations
      ADD CONSTRAINT user_operations_activity_type_check
      CHECK (activity_type IN ('operativo','inversion','financiamiento'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_operations_status_check'
  ) THEN
    ALTER TABLE user_operations
      ADD CONSTRAINT user_operations_status_check
      CHECK (status IN ('realizado','proyectado','pendiente'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_operations_activity ON user_operations(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_operations_status   ON user_operations(status);
