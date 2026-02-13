# ⚙️ CONFIGURAR VARIABLES DE ENTORNO EN RENDER

## PASO 1: Ve a tu servicio en Render

1. Abre: **https://dashboard.render.com**
2. Verás tu servicio (probablemente se llama `pymax-app` o similar)
3. **Click en el nombre de tu servicio**

## PASO 2: Ve a Environment

1. En el menú lateral izquierdo, busca **"Environment"**
2. **Click en "Environment"**

## PASO 3: Agregar Variables

Vas a ver un botón que dice **"Add Environment Variable"**

### Variable 1: SECRET_KEY

1. Click **"Add Environment Variable"**
2. En **Key:** escribe exactamente: `SECRET_KEY`
3. En **Value:** escribe: `pymax-super-secret-key-2024-production-change-this`
4. Click **"Save Changes"**

### Variable 2: SUPABASE_URL

1. Click **"Add Environment Variable"** otra vez
2. En **Key:** escribe exactamente: `SUPABASE_URL`
3. En **Value:** pega tu URL de Supabase (la que copiaste)
   - Debe verse así: `https://tuproyecto.supabase.co`
4. Click **"Save Changes"**

### Variable 3: SUPABASE_KEY

1. Click **"Add Environment Variable"** otra vez
2. En **Key:** escribe exactamente: `SUPABASE_KEY`
3. En **Value:** pega tu Key de Supabase (la que copiaste - es LARGA)
   - Empieza con: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Click **"Save Changes"**

## PASO 4: Redeploy

**MUY IMPORTANTE:** Después de agregar las variables, debes hacer redeploy:

1. En la parte superior, busca el botón **"Manual Deploy"**
2. Click en **"Manual Deploy"**
3. Selecciona **"Deploy latest commit"**
4. Espera 1-2 minutos

## PASO 5: Verifica

1. Ve a la pestaña **"Logs"**
2. Espera hasta ver: **"Booting worker with pid"** o **"Listening on"**
3. Cuando esté listo, verás el estado en **verde: "Live"**
4. Click en tu URL (arriba) para probar

---

## ✅ RESUMEN

Debes tener estas 3 variables:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | `pymax-super-secret-key-2024-production-change-this` |
| `SUPABASE_URL` | `https://tuproyecto.supabase.co` |
| `SUPABASE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

---

## 🚨 SI SIGUES CON ERROR

1. Revisa que las variables estén EXACTAS (sin espacios extras)
2. Verifica que `SUPABASE_URL` empiece con `https://`
3. Verifica que `SUPABASE_KEY` sea la key **"anon"**, no "service_role"
4. Haz **Manual Deploy** después de cambiar variables
