-- ============================================================
-- PYMAX · COLUMNAS FALTANTES EN user_operations
-- ============================================================
-- El código (ventas-gastos, panel-essential, deudas, flujo-caja)
-- usa estas columnas, pero el esquema base no las definía, lo que
-- provocaba el error "Could not find the 'X' column" al registrar
-- un ingreso o un gasto.
--
-- Ejecutar en Supabase → SQL Editor → New Query → Run.
-- Es idempotente (puede ejecutarse más de una vez sin error).
-- ============================================================

ALTER TABLE user_operations
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS notes       TEXT,
  ADD COLUMN IF NOT EXISTS date        DATE,
  ADD COLUMN IF NOT EXISTS metadata    JSONB DEFAULT '{}'::jsonb;
