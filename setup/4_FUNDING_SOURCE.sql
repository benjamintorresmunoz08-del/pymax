-- ============================================================
-- PYMAX · FUENTE DE FONDOS (origen del pago)
-- ============================================================
-- Permite distinguir si un pago se realiza con:
--   'caja'    → Dinero de la caja / flujo de caja operativo (descuenta el balance)
--   'externo' → Dinero externo (aporte de capital, préstamo, inversionista)
--               (NO descuenta el flujo de caja)
--
-- Ejecutar en Supabase → SQL Editor → New Query → Run.
-- ============================================================

ALTER TABLE user_operations
  ADD COLUMN IF NOT EXISTS funding_source TEXT DEFAULT 'caja';
