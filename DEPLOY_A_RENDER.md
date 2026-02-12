# 🚀 DEPLOY A RENDER - PYMAX

## ✅ PASO 1: Ir a Render

1. **Abre**: https://render.com
2. **Inicia sesión** o crea cuenta (usa GitHub)

---

## ✅ PASO 2: Crear Web Service

1. **Clic en** "New +" (arriba derecha)
2. **Selecciona** "Web Service"
3. **Conecta** tu repositorio de GitHub:
   - Repositorio: `benjamintorresmunoz08-del/pymax`
   - Branch: `main`

---

## ✅ PASO 3: Configurar el servicio

### Settings (Configuración):

**Name**: `pymax` (o el que quieras)

**Region**: `Oregon (US West)` o el más cercano

**Branch**: `main`

**Root Directory**: (dejar vacío)

**Runtime**: `Python 3`

**Build Command**:
```bash
pip install -r requirements.txt
```

**Start Command**:
```bash
gunicorn app:app
```

**Instance Type**: `Free`

---

## ✅ PASO 4: Variables de entorno

**Clic en** "Advanced" → "Add Environment Variable"

Agregar estas variables:

| KEY | VALUE |
|-----|-------|
| `PYTHON_VERSION` | `3.11.0` |
| `SECRET_KEY` | (cualquier texto largo aleatorio) |

**Ejemplo de SECRET_KEY**:
```
pymax-super-secret-key-2026-production-render
```

---

## ✅ PASO 5: Deploy

1. **Clic en** "Create Web Service"
2. **Espera** 5-10 minutos (Render instala dependencias y despliega)
3. **Verás** logs en tiempo real

---

## ✅ PASO 6: Verificar

Una vez completado, verás:
- ✅ "Deploy live"
- ✅ URL: `https://pymax.onrender.com` (o similar)

**Clic en la URL** para abrir tu aplicación.

---

## 🔍 VERIFICAR QUE FUNCIONA:

1. **Abre** la URL de Render
2. **Haz login** con tu email/password
3. **Ve a** "Ventas & Gastos"
4. **Registra** una operación

Si funciona → ✅ Deploy exitoso  
Si falla → Envíame screenshot de los logs

---

## ⚠️ NOTA IMPORTANTE:

### Free Tier de Render:
- ✅ GRATIS
- ⚠️ Se "duerme" después de 15 min sin uso
- ⚠️ Primera carga puede tardar 30-60 segundos (wake up)
- ✅ Perfecto para desarrollo y pruebas

### Para producción real:
- Upgrade a plan pagado ($7/mes)
- Sin "sleep", siempre activo
- Mejor performance

---

## 🎯 DESPUÉS DEL DEPLOY:

Una vez que tengas la URL funcionando, avísame para:
1. ✅ Perfeccionar todos los módulos de MOVER
2. ✅ Dejar todo hermoso y funcional
3. ✅ Integrar paneles IA en cada módulo

---

## 📝 TROUBLESHOOTING:

### Error: "Build failed"
- Verifica que `requirements.txt` esté en la raíz
- Verifica que `gunicorn` esté en requirements.txt

### Error: "Application failed to start"
- Verifica el Start Command: `gunicorn app:app`
- Revisa los logs en Render Dashboard

### Error 500 en la URL
- Verifica las variables de entorno
- Verifica que SECRET_KEY esté configurado

---

**¡Listo! Sigue estos pasos y tendrás tu URL profesional en 10 minutos.** 🚀
