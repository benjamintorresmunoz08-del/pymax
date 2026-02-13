# 🚀 DEPLOY PYMAX EN RENDER - PASOS FINALES

## ✅ **PREREQUISITOS COMPLETADOS:**
- ✅ Código subido a GitHub
- ✅ app.py limpio (sin errores de SQLAlchemy)
- ✅ requirements.txt actualizado
- ✅ Procfile y render.yaml listos

---

## 📋 **PASO 1: EJECUTAR SCRIPT SQL EN SUPABASE (IMPORTANTE)**

**Antes de deployar, debes crear las tablas para Tiburón y Hambre:**

1. **Abre Supabase:**
   - https://supabase.com/dashboard/project/TU_PROYECTO

2. **SQL Editor:**
   - Click "SQL Editor" (menú izquierdo)

3. **Copia el script:**
   - Abre: `database/CREATE_CRM_OPERATIONS_TABLES.sql`
   - Selecciona TODO (Ctrl+A)
   - Copia (Ctrl+C)

4. **Ejecuta:**
   - Pega en Supabase SQL Editor
   - Click botón verde "Run"
   - Espera mensaje: ✅ "user_leads table created successfully"
   - ✅ "user_tasks table created successfully"

---

## 🌐 **PASO 2: CREAR WEB SERVICE EN RENDER**

### 1. Ve a Render:
https://dashboard.render.com

### 2. Click "New +"
- Selecciona **"Web Service"**

### 3. Conecta tu repositorio:
- Si es la primera vez:
  - Click "Connect GitHub"
  - Autoriza Render
- Busca tu repositorio: `pymax` o `PYMAXCENTER1`
- Click **"Connect"**

### 4. Configuración del servicio:

**Name:** `pymax-app` (o el nombre que prefieras)

**Region:** `Oregon (US West)` (o el más cercano a ti)

**Branch:** `main`

**Runtime:** `Python 3`

**Build Command:**
```
pip install -r requirements.txt
```

**Start Command:**
```
gunicorn app:app --bind 0.0.0.0:$PORT
```

**Instance Type:** `Free` (o el que prefieras)

---

## 🔐 **PASO 3: CONFIGURAR VARIABLES DE ENTORNO**

Antes de hacer deploy, **DEBES agregar estas variables:**

### 1. Scroll down hasta "Environment Variables"

### 2. Agrega estas 3 variables:

#### Variable 1: SECRET_KEY
- **Key:** `SECRET_KEY`
- **Value:** (genera uno seguro, ejemplo):
  ```
  super-secret-key-change-this-in-production-12345
  ```

#### Variable 2: SUPABASE_URL
- **Key:** `SUPABASE_URL`
- **Value:** Tu URL de Supabase
  ```
  https://tuproyecto.supabase.co
  ```

#### Variable 3: SUPABASE_KEY
- **Key:** `SUPABASE_KEY`
- **Value:** Tu Anon/Public Key de Supabase
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

**¿Dónde encuentro SUPABASE_URL y SUPABASE_KEY?**
- Abre Supabase → Tu proyecto
- Click en "Settings" (⚙️)
- Click en "API"
- Copia:
  - **URL:** Project URL
  - **Key:** `anon` `public` key

---

## 🎯 **PASO 4: DEPLOY**

### 1. Click botón azul "Create Web Service"

### 2. Espera...
- Render instalará dependencias (1-2 minutos)
- Verás logs en tiempo real
- Espera hasta ver: ✅ **"Live"** (verde)

### 3. ¡LISTO!
Tu app estará en:
```
https://pymax-app.onrender.com
```
(O el nombre que le pusiste)

---

## 🧪 **PASO 5: VERIFICAR QUE TODO FUNCIONA**

### 1. Abre tu URL de Render

### 2. Prueba:
- ✅ Página principal carga
- ✅ Login/Register funciona
- ✅ Panel MOVER carga
- ✅ Cambiar idioma funciona
- ✅ Agregar transacción funciona
- ✅ Dashboard se actualiza

### 3. Prueba servicios premium:
- ✅ **Tiburón:** Click "Add Lead" → Debe funcionar
- ✅ **Hambre:** Click "Add Task" → Debe funcionar

---

## 🔧 **SI HAY PROBLEMAS:**

### Error: "Application failed to start"
**Solución:** Revisa los logs en Render:
- Click en tu servicio
- Pestaña "Logs"
- Lee el último error

### Error: "Module not found"
**Solución:** Verifica `requirements.txt`
- Debe tener Flask, gunicorn, python-dotenv

### Error: "supabase is not defined"
**Solución:** Verifica variables de entorno:
- `SUPABASE_URL` y `SUPABASE_KEY` deben estar configuradas

### Error 404 en rutas
**Solución:** Force redeploy:
- Render Dashboard → Tu servicio
- Click "Manual Deploy" → "Deploy latest commit"

---

## 📱 **BONUS: DOMINIO PERSONALIZADO**

Si quieres usar tu propio dominio (ej: `pymax.com`):

1. Render Dashboard → Tu servicio
2. Pestaña "Settings"
3. Sección "Custom Domain"
4. Click "Add Custom Domain"
5. Sigue instrucciones para configurar DNS

---

## ✅ **CHECKLIST FINAL**

Antes de usar en producción, verifica:

- [ ] Script SQL ejecutado en Supabase
- [ ] Variables de entorno configuradas
- [ ] App en "Live" (verde)
- [ ] Login funciona
- [ ] Dashboard carga datos reales
- [ ] Tiburón y Hambre funcionan
- [ ] Cambio de idioma funciona
- [ ] No hay errores en logs

---

## 🎉 **¡FELICIDADES!**

Tu app PYMAX está ahora **100% en producción** en Render.

**URL de tu app:** https://TU-APP.onrender.com

---

## 📞 **SOPORTE**

Si tienes problemas:
1. Revisa logs en Render
2. Verifica variables de entorno
3. Asegúrate de que Supabase esté accesible
4. Force redeploy si es necesario

**Documentación Render:** https://render.com/docs
