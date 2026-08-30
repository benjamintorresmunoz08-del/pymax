-- ============================================================
-- PYMAX · FIX: check constraint "user_operations_status_check"
-- ============================================================
-- Error: "new row violates check constraint user_operations_status_check"
-- Causa: la columna `status` ya existía y `ADD COLUMN IF NOT EXISTS ...
-- DEFAULT` NO aplicó el default, dejándolo en NULL. El código no envía
-- `status` al insertar, así que entra NULL y viola el CHECK.
--
-- Solución: forzar el default y corregir filas con NULL.
-- Ejecutar en Supabase → SQL Editor → New Query → Run (idempotente).
-- ============================================================

ALTER TABLE user_operations ALTER COLUMN status        SET DEFAULT 'realizado';
ALTER TABLE user_operations ALTER COLUMN activity_type SET DEFAULT 'operativo';
ALTER TABLE user_operations ALTER COLUMN funding_source SET DEFAULT 'caja';

UPDATE user_operations SET status        = 'realizado' WHERE status        IS NULL OR status        = '';
UPDATE user_operations SET activity_type = 'operativo' WHERE activity_type IS NULL OR activity_type = '';
UPDATE user_operations SET funding_source = 'caja'     WHERE funding_source IS NULL OR funding_source = '';
