# 🚀 Desplegar PYMAX en Render

## Cambios aplicados para que funcione

1. **Sin SQLite** – La app exige `DATABASE_URL` (Supabase)
2. **Sin fallbacks locales** – `SECRET_KEY` y `DATABASE_URL` obligatorios
3. **Gunicorn con PORT** – `--bind 0.0.0.0:$PORT` para Render
4. **Rutas relativas eliminadas** – Todas las rutas usan `/` o rutas absolutas
5. **`runtime.txt`** – Python 3.11.0

---

## Pasos para desplegar

### 1. Subir a GitHub

```bash
git add .
git commit -m "Configuración para Render"
git push origin main
```

### 2. Crear el Web Service en Render

1. Entra a **https://dashboard.render.com**
2. **New** → **Web Service**
3. Conecta tu repo de GitHub y elige el proyecto
4. Render detectará `render.yaml` (o usa estos valores si no lo usa):

| Campo | Valor |
|-------|-------|
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app --bind 0.0.0.0:$PORT` |
| **Plan** | Free |

### 3. Variables de entorno

En **Environment** añade:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Tu URL de Supabase (Settings → Database → Connection string → URI) |
| `SECRET_KEY` | Una cadena aleatoria segura (o usa "Generate" en Render) |

**Cómo obtener DATABASE_URL:**

1. Supabase → **Settings** → **Database**
2. En **Connection string** elige **URI**
3. Copia algo como:  
   `postgresql://postgres.xxx:PASSWORD@xxx.supabase.co:5432/postgres?sslmode=require`
4. Sustituye `[YOUR-PASSWORD]` por tu contraseña de base de datos si aparece

### 4. Deploy

Clic en **Create Web Service**. Espera 3–5 minutos.

---

## Si falla el deploy

**Error: "DATABASE_URL is required"**  
→ Añade la variable en Render > Environment.

**Error: "SECRET_KEY is required"**  
→ Añade la variable o usa "Generate" en Render.

**Error: "Application failed to respond"**  
→ Comprueba que el Start Command sea:  
`gunicorn app:app --bind 0.0.0.0:$PORT`

**Error de conexión a base de datos**  
→ Verifica que la URL de Supabase sea correcta y que el proyecto esté activo.

---

## Configuración en Supabase

En **Settings** → **API** de Supabase:

- **Project URL** – Debe estar en las plantillas (ya está)
- **anon public** – Se usa en el frontend; es público por diseño

En **Authentication** → **URL Configuration**:

- **Site URL**: `https://TU-APP.onrender.com`
- **Redirect URLs**: `https://TU-APP.onrender.com/**`

Así el login y el registro funcionarán en producción.
