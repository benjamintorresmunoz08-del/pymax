# 🏢 SISTEMA MULTI-EMPRESA - INSTRUCCIONES DE INSTALACIÓN

## 🎯 QUÉ HACE ESTE SISTEMA:

✅ **Múltiples empresas** pueden usar Pymax  
✅ **3 usuarios por empresa** en Plan Mover  
✅ **Datos completamente separados** entre empresas  
✅ **Roles**: Owner, Admin, Member  
✅ **Onboarding wizard** después del registro  
✅ **Seguridad RLS** garantizada  

---

## 📋 PASO A PASO (OBLIGATORIO):

### **PASO 1: Ejecutar SQL en Supabase** 🔴 CRÍTICO

1. **Abre Supabase**: https://supabase.com
2. **Ve a tu proyecto**: `haqjuyagyvxynmulanhe`
3. **Click en "SQL Editor"** (menú izquierdo)
4. **Click en "New Query"**
5. **Copia TODO el contenido** de: `database/CREAR_SISTEMA_MULTIEMPRESA.sql`
6. **Pega en el editor**
7. **Click en RUN** (botón verde)
8. **Espera confirmación**: "✅ SISTEMA MULTI-EMPRESA CREADO EXITOSAMENTE"

**⚠️ SIN ESTE PASO NADA FUNCIONARÁ**

---

### **PASO 2: Verificar que se creó correctamente**

En Supabase SQL Editor, ejecuta:

```sql
-- Ver tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'company_members');
```

Deberías ver:
- `companies` ✅
- `company_members` ✅

---

### **PASO 3: Verificar columnas agregadas**

```sql
-- Ver que user_operations tiene company_id
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_operations' 
AND column_name = 'company_id';
```

Debería devolver: `company_id | uuid`

---

## 🔄 CÓMO FUNCIONA EL FLUJO:

### **Usuario NUEVO (Primera vez):**

```
1. Usuario se registra en /
2. Supabase crea cuenta
3. Redirect automático a /onboarding
4. Wizard de 3 pasos:
   - Paso 1: Nombre empresa, RUT, industria
   - Paso 2: Objetivos (opciones múltiples)
   - Paso 3: Confirmar Plan Mover
5. Se crea:
   - Registro en tabla `companies`
   - Registro en `company_members` (usuario como owner)
6. Redirect a /empresa/mover
7. Usuario ve SU dashboard vacío (listo para usar)
```

### **Usuario EXISTENTE:**

```
1. Usuario hace login en /
2. Sistema verifica: ¿Tiene empresa?
   - SÍ → Redirect a /empresa/mover (ve sus datos)
   - NO → Redirect a /onboarding
```

### **Usuario INVITADO (2do o 3er usuario):**

```
1. Owner va a "Configuración" (próximo a crear)
2. Ingresa email del nuevo usuario
3. Sistema valida:
   - ¿Ya existe usuario con ese email? ✅
   - ¿Hay espacio? (máx 3 en Plan Mover) ✅
4. Se agrega a `company_members`
5. Nuevo usuario hace login → Ve datos de LA MISMA EMPRESA
```

---

## 🔒 SEGURIDAD (RLS):

### **Políticas creadas:**

**`companies`:**
- Ver: Solo empresas donde eres miembro
- Actualizar: Solo si eres owner
- Crear: Cualquier usuario autenticado (al registrarse)

**`company_members`:**
- Ver: Solo miembros de tu empresa
- Agregar: Solo owner/admin
- Remover: Solo owner/admin (no puedes remover al owner)

**`user_operations` (y todas las tablas):**
- Ver: Solo datos de TU empresa (`company_id = tu_empresa`)
- Crear: Solo con tu `company_id`
- Actualizar/Eliminar: Solo datos de TU empresa

---

## 🎛️ LÍMITE DE USUARIOS POR PLAN:

**Plan Mover:** 3 usuarios máximo  
**Plan Tiburón:** 10 usuarios máximo  
**Plan Hambre:** Ilimitado  

**Validación:**
- Trigger en Supabase valida ANTES de insertar en `company_members`
- Si se alcanza el límite → Error: "La empresa ha alcanzado el límite de X usuarios"
- Frontend también valida antes de invitar

---

## 🧪 TESTING:

### **Test 1: Crear empresa nueva**

1. Registra usuario nuevo: `test@empresa1.com`
2. Completa onboarding
3. Verifica que se creó en Supabase:

```sql
SELECT c.name, cm.role, u.email
FROM companies c
JOIN company_members cm ON cm.company_id = c.id
JOIN auth.users u ON u.id = cm.user_id
WHERE u.email = 'test@empresa1.com';
```

### **Test 2: Límite de 3 usuarios**

1. Como owner, invita a `user2@empresa1.com`
2. Invita a `user3@empresa1.com`
3. Intenta invitar `user4@empresa1.com` → Debe fallar con error de límite

### **Test 3: Separación de datos**

1. Crea empresa1 con `test@empresa1.com`
2. Registra 5 transacciones en empresa1
3. Crea empresa2 con `test@empresa2.com`
4. Registra 3 transacciones en empresa2
5. Verifica que cada una VE SOLO SUS DATOS

---

## 📊 ARCHIVOS CREADOS/MODIFICADOS:

### **NUEVOS:**
- `database/CREAR_SISTEMA_MULTIEMPRESA.sql` (script SQL completo)
- `static/js/pymax-company-manager.js` (gestor de empresas JS)
- `templates/onboarding.html` (wizard 3 pasos)
- `INSTRUCCIONES_MULTIEMPRESA.md` (este archivo)

### **MODIFICADOS:**
- `app.py` (ruta /onboarding)
- `static/js/pymax-data-manager.js` (usa company_id)
- `templates/empresa/mover/panel-mover.html` (verifica empresa antes de cargar)

---

## ⚠️ IMPORTANTE ANTES DE DESPLEGAR:

### **1. Migrar datos existentes (si los hay)**

Si ya tienes transacciones en `user_operations` sin `company_id`:

```sql
-- Opción A: Asignar a una empresa por defecto
UPDATE user_operations 
SET company_id = (SELECT id FROM companies LIMIT 1)
WHERE company_id IS NULL;

-- Opción B: Eliminar datos de prueba
DELETE FROM user_operations WHERE company_id IS NULL;
```

### **2. Hacer company_id OBLIGATORIO (futuro)**

Después de migrar datos:

```sql
ALTER TABLE user_operations ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE user_inventory ALTER COLUMN company_id SET NOT NULL;
-- etc...
```

---

## 🚀 PRÓXIMOS PASOS:

Después de que esto funcione:

1. ✅ Crear página "Configuración Empresa"
   - Ver miembros actuales
   - Invitar nuevos usuarios
   - Cambiar nombre/datos empresa
   
2. ✅ Recuperar contraseña

3. ✅ Exportar reportes PDF

4. ✅ Calculadora de impuestos

---

## ❓ PREGUNTAS FRECUENTES:

**P: ¿Qué pasa si un usuario se registra pero no completa el onboarding?**  
R: No podrá acceder a ningún panel hasta crear su empresa.

**P: ¿Puedo agregar un 4to usuario a Plan Mover?**  
R: No, el trigger bloqueará la inserción. Debes upgradeara plan Tiburón.

**P: ¿Qué pasa si elimino una empresa?**  
R: `ON DELETE CASCADE` eliminará todos los datos (operaciones, inventario, etc.) y todos los miembros.

**P: ¿Cómo cambio de empresa si tengo varias?**  
R: Próxima feature: Selector de empresa en navbar (si usuario pertenece a más de 1).

---

✅ **LISTO PARA EJECUTAR**
