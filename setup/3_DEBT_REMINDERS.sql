-- ============================================================================
-- PYMAX · TABLA DE RECORDATORIOS DE DEUDAS
-- ============================================================================
-- Registra qué recordatorios de email ya se enviaron para cada obligación,
-- evitando duplicados. El backend (app.py) la usa con SERVICE_ROLE_KEY.
--
-- Ejecutar en Supabase → SQL Editor → New Query → pegar y Run.
-- ============================================================================

CREATE TABLE IF NOT EXISTS debt_reminders (
    id BIGSERIAL PRIMARY KEY,
    obligation_id BIGINT NOT NULL,
    due_date DATE,
    days_before SMALLINT NOT NULL DEFAULT 0,
    sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (obligation_id, days_before)
);

-- Índice para búsquedas rápidas por obligación
CREATE INDEX IF NOT EXISTS idx_debt_reminders_obligation ON debt_reminders(obligation_id);

-- RLS: sin acceso público (solo el backend con service role lo usa)
ALTER TABLE debt_reminders ENABLE ROW LEVEL SECURITY;
