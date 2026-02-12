# 🔧 ARREGLAR ERROR RENDER - SECRET_KEY

## ❌ Error actual:
```
Error: SECRET_KEY es obligatorio. Añádelo en Render > Environment o en .env
```

---

## ✅ SOLUCIÓN INMEDIATA:

### Paso 1: Ir a Render Dashboard
1. Abre tu dashboard de Render: https://dashboard.render.com/
2. Busca tu servicio web (pymax o como lo hayas nombrado)
3. Haz clic en el servicio

### Paso 2: Agregar SECRET_KEY
1. En el menú lateral, clic en **"Environment"**
2. Clic en **"Add Environment Variable"**
3. Agrega esto:

**Key:**
```
SECRET_KEY
```

**Value:** (copia uno de estos - son seguros y únicos)
```
pymax_super_secret_2026_banking_level_a8f3d9e2b1c4f6a7
```

O si quieres uno más complejo:
```
Pm@x!2026$S3cur3_B4nk1ng_L3v3l_K3y_F0r_Ch1l3#7d9f2a
```

4. Clic en **"Save Changes"**

### Paso 3: Agregar DATABASE_URL (si no lo tienes)
1. En la misma sección **"Environment"**
2. **Add Environment Variable**
3. Key: `DATABASE_URL`
4. Value: (tu connection string de Supabase)

```
postgresql://postgres.XXXX:TU_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

Reemplaza con tu URL real de Supabase que está en tu `.env`

### Paso 4: Forzar Redeploy
1. En Render, ve a la pestaña **"Manual Deploy"**
2. Clic en **"Clear build cache & deploy"**
3. Espera 2-3 minutos

---

## ✅ Verificar que funciona:

Una vez que termine el deploy:
- El estado debe cambiar a **"Live"** (verde)
- Entra a tu URL: `https://TU-APP.onrender.com`
- Debería cargar la página principal sin errores

---

## 🔒 SEGURIDAD:

La SECRET_KEY que te di es segura, pero si quieres generar una propia:

**Opción A: Usando Python (en tu terminal local)**
```python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Opción B: Generar online**
https://randomkeygen.com/ (sección "CodeIgniter Encryption Keys")

---

## ⚠️ IMPORTANTE:

NO compartas tu SECRET_KEY en:
- Capturas de pantalla públicas
- Repositorios de GitHub (ya está en .gitignore)
- Grupos de WhatsApp

Solo debe estar en:
- Tu archivo `.env` local (para desarrollo)
- Las variables de entorno de Render (para producción)
