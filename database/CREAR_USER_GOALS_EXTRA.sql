-- Crear tabla user_goals_extra si no existe (para metas 2 y 3)
-- Ejecuta esto en Supabase SQL Editor si ves error 400 con user_goals_extra

CREATE TABLE IF NOT EXISTS user_goals_extra (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    slot_number INTEGER NOT NULL,
    goal_text TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_user_goals_extra_user_id ON user_goals_extra(user_id);

-- RLS (opcional - descomenta si necesitas)
-- ALTER TABLE user_goals_extra ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Users manage own goals extra" ON user_goals_extra;
-- CREATE POLICY "Users manage own goals extra" ON user_goals_extra
--     FOR ALL USING (auth.uid() = user_id);

SELECT 'user_goals_extra creada correctamente' AS resultado;
