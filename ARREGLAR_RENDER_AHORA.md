# 🔧 ARREGLAR RENDER - Solución EXACTA

## ❌ Error que tienes:
```
Could not parse SQLAlchemy URL from given URL string
```

Esto pasa porque Render no tiene bien configuradas las variables de entorno.

---

## ✅ SOLUCIÓN (5 minutos):

### Paso 1: Ir a Render
1. Abre: https://dashboard.render.com/
2. Busca tu servicio (pymax-backend-6d37 o como lo llamaste)
3. Clic en el servicio

### Paso 2: Ir a Environment
1. En el menú lateral izquierdo, clic en **"Environment"**
2. Verás las variables que tienes (o estará vacío)

### Paso 3: Agregar/Editar DATABASE_URL
Si ya existe `DATABASE_URL`:
- Clic en el **lápiz** (editar)
- **Borra todo** lo que esté ahí
- Pega esto EXACTAMENTE (sin comillas, sin espacios extra):

```
postgresql://postgres.haqjuyagyvxynmulanhe:gyVc5XAMZ1CqZpad@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

Si NO existe:
- Clic en **"Add Environment Variable"**
- Key: `DATABASE_URL`
- Value: pega la línea de arriba
- Clic en **Save**

### Paso 4: Agregar SECRET_KEY
- Clic en **"Add Environment Variable"**
- Key: `SECRET_KEY`
- Value: `CLAVE_MAESTRA_PYMAX_SEGURIDAD_TOTAL_2026`
- Clic en **Save**

### Paso 5: Hacer Redeploy
1. Ve a la pestaña **"Manual Deploy"** (arriba)
2. Clic en **"Deploy latest commit"**
3. Espera 2-3 minutos

---

## ✅ Verificar que funciona:

Cuando termine el deploy:
1. El estado debe decir **"Live"** (verde)
2. Abre tu URL: https://pymax-backend-6d37.onrender.com
3. Deberías ver tu página principal sin errores

---

## 🚨 SI SIGUE FALLANDO:

Captura de pantalla de:
1. La sección **Environment** de Render (donde están las variables)
2. Los logs del error (la pantalla que me mostraste)

Y me los mandas para revisar exactamente qué está pasando.

---

## 📝 RESUMEN RÁPIDO:

En Render → Environment → Necesitas 2 variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres.haqjuyagyvxynmulanhe:gyVc5XAMZ1CqZpad@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require` |
| `SECRET_KEY` | `CLAVE_MAESTRA_PYMAX_SEGURIDAD_TOTAL_2026` |

Después: Manual Deploy → Deploy latest commit

¡Listo! 🚀
