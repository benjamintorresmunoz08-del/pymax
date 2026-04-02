# 🚀 GUÍA DE DESPLIEGUE EN RENDER

## ✅ CHECKLIST PRE-DESPLIEGUE

### Archivos Verificados:
- [x] `requirements.txt` - Dependencias Python (Flask, gunicorn)
- [x] `runtime.txt` - Python 3.11.0
- [x] `app.py` - Flask app configurado correctamente
- [x] `.gitignore` - Protege archivos sensibles
- [x] `static/` - Archivos CSS/JS
- [x] `templates/` - Templates HTML

### Estado Actual:
- **Branch:** main
- **Archivos nuevos sin commitear:** 3 archivos del AI Companion System

---

## 📋 PASO 1: COMMIT DE ARCHIVOS NUEVOS

Ejecuta estos comandos en tu terminal:

```bash
# 1. Agregar archivos nuevos del AI Companion System
git add static/js/pymax-temporal-memory.js
git add static/js/pymax-ai-companion.js
git add static/css/pymax-ai-companion.css

# 2. Agregar cambios en panel-mover.html
git add templates/empresa/mover/panel-mover.html

# 3. Commit con mensaje descriptivo
git commit -m "feat: Add AI Companion System (FASE 26) - Sistema de manifestación inteligente con memoria temporal"

# 4. Push a GitHub
git push origin main
```

---

## 🌐 PASO 2: CONFIGURAR EN RENDER

### 2.1 Crear Nuevo Web Service

1. Ve a https://dashboard.render.com/
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub: `benjamintorresmunoz08-del/pymax`

### 2.2 Configuración del Service

**Build & Deploy:**
- **Name:** `pymax-financial-system` (o el nombre que prefieras)
- **Region:** Oregon (US West) o la más cercana
- **Branch:** `main`
- **Root Directory:** (dejar vacío)
- **Runtime:** `Python 3`
- **Build Command:**
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command:**
  ```bash
  gunicorn app:app
  ```

**Instance:**
- **Instance Type:** `Free` (para empezar)

### 2.3 Variables de Entorno (Environment Variables)

⚠️ **IMPORTANTE:** Configura estas variables en Render (NO subir .env a GitHub):

```env
# SUPABASE (REQUERIDO)
SUPABASE_URL=https://haqjuyagyvxynmulanhe.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcWp1eWFneXZ4eW5tdWxhbmhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjU0MjQsImV4cCI6MjA4MTQwMTQyNH0.3aSIfr3s5spESzEv_UAaqYkJzVyhbkK8ZpSlExY0A3g

# SEGURIDAD
SECRET_KEY=eYoMl1tOwyN0PRMbi

# BASE DE DATOS (Opcional - Supabase ya incluye PostgreSQL)
DATABASE_URL=postgresql://postgres.haqjuyagyvxynmulanhe:eYoMl1tOwyN0PRMb@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require

# ENTORNO
FLASK_ENV=production

# INTEGRACIONES (Opcional - para funcionalidades futuras)
# OPENAI_API_KEY=tu_clave_aqui
# ANTHROPIC_API_KEY=tu_clave_aqui
```

**Cómo agregar variables en Render:**
1. En tu Web Service, ve a **"Environment"**
2. Click en **"Add Environment Variable"**
3. Agrega cada variable (KEY = VALUE)
4. Click **"Save Changes"**

---

## 🔄 PASO 3: DEPLOY

1. Click en **"Create Web Service"**
2. Render automáticamente:
   - Clonará tu repositorio
   - Instalará dependencias (`pip install -r requirements.txt`)
   - Iniciará la app con gunicorn
   - Asignará una URL pública (ej: `https://pymax-financial-system.onrender.com`)

3. **Tiempo estimado:** 5-10 minutos

---

## ✅ VERIFICACIÓN POST-DEPLOY

### Verificar que funciona:

1. **URL de Render:** https://tu-app.onrender.com
2. **Rutas a probar:**
   - `/` - Página principal
   - `/empresa` - Vista empresa
   - `/empresa/mover/panel` - Panel financiero con AI Companion

### Logs en vivo:
- En Render Dashboard → Tu servicio → **"Logs"**
- Verifica que no haya errores

### Métricas:
- **CPU/Memory:** Monitorea en Render Dashboard
- **Tiempo de carga:** Debería ser < 3 segundos

---

## 🐛 TROUBLESHOOTING

### Problema: "Application failed to start"
**Solución:**
1. Verifica que `requirements.txt` tenga todas las dependencias
2. Revisa los logs en Render
3. Confirma que `app.py` tiene `if __name__ == '__main__':`

### Problema: "Module not found"
**Solución:**
1. Asegúrate que la dependencia esté en `requirements.txt`
2. Re-deploy desde Render Dashboard

### Problema: "Cannot connect to Supabase"
**Solución:**
1. Verifica que `SUPABASE_URL` y `SUPABASE_KEY` estén en Environment Variables
2. Confirma que las credenciales sean correctas

### Problema: "Static files not loading"
**Solución:**
1. Verifica que la carpeta `static/` esté en el repositorio
2. Confirma que Flask esté sirviendo correctamente: `app = Flask(__name__)`

---

## 🔄 ACTUALIZACIONES FUTURAS

Para actualizar tu app en Render:

```bash
# 1. Haz cambios en tu código
# 2. Commit
git add .
git commit -m "feat: Nueva funcionalidad"
git push origin main

# 3. Render automáticamente re-deployará
```

**Auto-Deploy está activado por defecto** en Render. Cada push a `main` triggerea un nuevo deploy.

---

## 📊 FEATURES INCLUIDAS EN EL DEPLOY

✅ Sistema de autenticación con Supabase
✅ Dashboard financiero interactivo
✅ **AI Companion System (FASE 26)** - Sistema de manifestación inteligente
✅ Temporal Memory System - Gestión de memoria de corto/largo plazo
✅ Orbital System - Visualización de datos financieros
✅ Holographic Command Center
✅ Multi-idioma (ES/EN/PT)
✅ Temas personalizables
✅ Backup & Export
✅ Calendar System
✅ Chat IA
✅ Widgets informativos
✅ Reportes automáticos

---

## 🎯 PRÓXIMOS PASOS POST-DEPLOY

1. **Conectar dominio personalizado** (Opcional)
   - En Render → Settings → Custom Domain
   
2. **Configurar SSL** (Automático en Render)

3. **Monitorear métricas:**
   - Uptime
   - Response time
   - Error rate

4. **Configurar Alertas:**
   - Email notifications en Render

5. **Backup automático de Supabase:**
   - Configurar en Supabase Dashboard

---

## 📞 SOPORTE

- **Render Docs:** https://render.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Flask Docs:** https://flask.palletsprojects.com/

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

Tu aplicación Pymax está configurada y lista para desplegarse en Render. 

**Recuerda:** Primero haz el commit de los archivos nuevos (Paso 1) antes de crear el servicio en Render.

---

**Última actualización:** 2 Abril 2026
**Versión:** FASE 26 - AI Companion System
