# 🚀 CREAR TABLAS PARA TIBURÓN Y HAMBRE

## ¿Qué hace este script?

Crea 2 nuevas tablas para que los servicios premium funcionen con **datos 100% reales**:

1. **`user_leads`** - Para el CRM de Tiburón (gestión de clientes potenciales)
2. **`user_tasks`** - Para Operations de Hambre (gestión de tareas)

## 📋 Instrucciones

### 1. Abrir Supabase

Ve a tu proyecto Supabase: https://supabase.com/dashboard/project/_

### 2. Ir al Editor SQL

Click en **"SQL Editor"** en el menú lateral izquierdo

### 3. Copiar el script

Abre el archivo: `database/CREATE_CRM_OPERATIONS_TABLES.sql`

Copia TODO el contenido

### 4. Pegar y Ejecutar

- Pega el script en el editor SQL
- Click en **"Run"** (botón verde abajo a la derecha)

### 5. Verificar

Deberías ver 2 mensajes:
```
✅ user_leads table created successfully
✅ user_tasks table created successfully
```

## ✅ Listo

Ahora Tiburón y Hambre funcionarán con datos reales:
- Podrás agregar leads reales en el CRM
- Podrás crear tareas reales en Operations
- Todo sincronizado con tu usuario
- Protegido con RLS (solo ves tus propios datos)

---

**IMPORTANTE:** Ejecuta esto antes de probar Tiburón y Hambre para que los botones "Add Lead" y "Add Task" funcionen correctamente.
