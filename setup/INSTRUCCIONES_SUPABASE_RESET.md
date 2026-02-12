# 🔐 PYMAX - Instalación Supabase desde CERO (Nivel Bancario)

## Paso 1: Borrar todo lo anterior

1. Abre **Supabase Dashboard** → tu proyecto
2. Ve a **SQL Editor**
3. **New Query**
4. Abre el archivo: `setup/1_BORRAR_TODO_SUPABASE.sql`
5. **Copia TODO** el contenido
6. Pégalo en el SQL Editor
7. Clic en **Run** (o F5)
8. Espera que diga "Success" ✅

---

## Paso 2: Crear la base de datos segura

1. En el mismo **SQL Editor**
2. **New Query** (nueva pestaña)
3. Abre el archivo: `setup/2_CREAR_SUPABASE_SEGURO.sql`
4. **Copia TODO** el contenido
5. Pégalo
6. Clic en **Run**
7. Espera que diga "Success" ✅

---

## Paso 3: Verificar la seguridad

Ve a **Table Editor** y deberías ver:

- ✅ user_profiles
- ✅ user_operations
- ✅ obligaciones
- ✅ user_goals
- ✅ user_goals_extra
- ✅ user_inventory

Haz clic en cualquier tabla → pestaña **Policies**:

Deberías ver 3-4 políticas (SELECT, INSERT, UPDATE, DELETE) que dicen:  
`auth.uid() = user_id`

Eso significa: **Cada usuario solo ve lo suyo**.

---

## Paso 4: Configurar Authentication

1. Ve a **Authentication** → **Providers**
2. Asegúrate que **Email** esté en ON
3. En **Email Templates** → **Confirm signup**:
   - Cambia la URL de redirect a: `https://TU-APP.onrender.com`
   - (O si estás en local: `http://localhost:5000`)

---

## Paso 5: Probar

1. Haz `git push` de tus cambios
2. Render hará redeploy
3. Entra a tu app
4. Regístrate con un correo nuevo
5. Confirma el email
6. Inicia sesión
7. Elige "Empresa" o "Personal"
8. Debería funcionar sin errores

---

## 🛡️ Nivel de seguridad implementado

| Característica | Estado |
|---------------|--------|
| RLS activo | ✅ 100% |
| Validación de tipos | ✅ CHECK constraints |
| User ID = UUID | ✅ Anti SQL-injection |
| Cada user en bunker | ✅ auth.uid() obligatorio |
| Cascada de borrado | ✅ ON DELETE CASCADE |
| Timestamps auto | ✅ Triggers |
| Índices optimizados | ✅ Performance |

**No hay forma de que un usuario vea datos de otro.**  
Cada consulta pasa por `auth.uid()` antes de devolver resultados.

---

## Si algo falla

Comparte:
1. El mensaje exacto de error del SQL Editor
2. O captura de pantalla

Y lo arreglamos al instante.
