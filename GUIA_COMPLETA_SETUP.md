# 🚀 Guía Completa - PYMAX (Súper Simplificada)

**Tú solo copias y pegas. Yo te guío.**

---

## 📌 PARTE 1: SUPABASE (5 minutos)

### Paso 1.1 - Ir a Supabase
1. Abre: **https://supabase.com/dashboard**
2. Entra a tu proyecto (el que empieza con `haqjuyagyvxynmulanhe`)

### Paso 1.2 - Ejecutar el SQL
1. En el menú izquierdo: **SQL Editor**
2. Clic en **New Query**
3. Abre el archivo `setup/SUPABASE_SQL_EJECUTAR.sql` de este proyecto
4. **Copia TODO** el contenido (Ctrl+A, Ctrl+C)
5. Pégalo en el editor de Supabase
6. Clic en **Run** (o F5)
7. Si ves "Success" → ✅ Listo

### Paso 1.3 - Verificar que Auth está activo
- En el menú: **Authentication** > **Providers**
- Asegúrate que **Email** esté habilitado (debe estar en ON)

---

## 📌 PARTE 2: EJECUTAR LOCAL (2 minutos)

### Paso 2.1 - Abrir terminal en la carpeta del proyecto
- En Cursor: `Terminal` > `New Terminal`
- O abre PowerShell/CMD y escribe:
  ```
  cd c:\Users\benja\OneDrive\Escritorio\PYMAXCENTER1
  ```

### Paso 2.2 - Instalar dependencias
```
pip install -r requirements.txt
```

### Paso 2.3 - Ejecutar la app
```
python app.py
```

### Paso 2.4 - Probar
- Abre el navegador en: **http://localhost:5000** (o la URL que indique la terminal)
- Regístrate con un correo
- ¡Debería funcionar!

---

## 📌 PARTE 3: RENDER (Desplegar en internet)

### Paso 3.1 - Subir a GitHub (si no lo tienes)
1. Crea una cuenta en **github.com**
2. Crea un repo nuevo (por ejemplo: `pymax-center`)
3. En la carpeta del proyecto, abre terminal y ejecuta:
   ```
   git init
   git add .
   git commit -m "Primer commit PYMAX"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

### Paso 3.2 - Conectar Render
1. Ve a **https://render.com** y crea cuenta (gratis)
2. Clic en **New** > **Web Service**
3. Conecta tu cuenta de GitHub
4. Selecciona tu repo `pymax-center`
5. Render detectará automáticamente:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`

### Paso 3.3 - Variables de entorno en Render
En la sección **Environment** de Render, añade:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | (copia de tu .env - la URL de Supabase) |
| `SECRET_KEY` | `CLAVE_MAESTRA_PYMAX_SEGURIDAD_TOTAL_2026` |

**Dónde encontrar DATABASE_URL:**
- Supabase > **Settings** > **Database**
- Busca "Connection string" > **URI**
- Cópialo (empieza con `postgresql://`)

### Paso 3.4 - Deploy
Clic en **Create Web Service**. Espera 2-5 minutos. Te dará una URL como `https://pymax-app.onrender.com` ✅

---

## 🆘 ¿QUÉ HACER CUANDO NECESITAS AYUDA?

**Dime exactamente qué quieres**, por ejemplo:

- *"Quiero que al registrar un gasto se envíe un correo"*
- *"Añade un gráfico de cuánto gasto por categoría"*
- *"El botón X no funciona"*
- *"Necesito un reporte mensual en PDF"*

Yo te daré:
1. **El código exacto** que debes pegar
2. **Dónde** pegarlo (archivo y línea)
3. **Qué más** debes hacer (si hay config en Supabase, etc.)

**No necesitas conectarme a nada.** Solo me dices qué quieres y yo te preparo todo para que copies y pegues.

---

## 📋 Checklist rápido

- [ ] SQL ejecutado en Supabase
- [ ] `pip install -r requirements.txt` ejecutado
- [ ] `python app.py` corre sin errores
- [ ] Puedes registrarte e iniciar sesión
- [ ] (Opcional) App desplegada en Render

---

*Cualquier duda, pregúntame. Te ayudo paso a paso.* 💪
