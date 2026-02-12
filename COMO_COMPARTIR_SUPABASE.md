# 📤 Cómo compartir tu Supabase para que pueda revisarlo

No puedo conectarme directamente a tu Supabase, pero **puedes enviarme la información** y yo la reviso.

---

## Opción 1: Exportar el esquema (recomendado)

1. En **Supabase Dashboard** → tu proyecto
2. Menú **SQL Editor**
3. **New Query**
4. Pega y ejecuta esto:

```sql
-- Copia el resultado y pégalo en el chat
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;
```

5. **Copia TODO el resultado** (la tabla que muestra)
6. **Pégalo aquí** en el chat cuando me pidas algo

---

## Opción 2: Lista manual de tablas

Escribe algo como:

```
Mis tablas en Supabase:
- obligaciones: id, user_id, tipo, monto, fecha_pago, estado, email_contacto
- user_operations: id, user_id, amount, type, concept, category, created_at
- (etc.)
```

---

## Opción 3: Captura de pantalla

Si es más fácil, toma una captura de:
- **Table Editor** mostrando la lista de tablas
- O **SQL Editor** después de ejecutar el query de la Opción 1

Yo puedo leer imágenes.

---

## Qué puedo hacer con esa información

- Ver si faltan columnas o tablas
- Comprobar que los nombres coinciden con el código
- Sugerir cambios en RLS
- Proponer migraciones SQL si hace falta

Solo comparte la información cuando me pidas una revisión concreta.
