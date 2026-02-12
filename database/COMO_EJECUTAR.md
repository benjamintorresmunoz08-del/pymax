# 🔥 CÓMO ACTUALIZAR LA BASE DE DATOS DE SUPABASE

## ⚠️ IMPORTANTE: Lee esto antes de ejecutar

Este script **BORRA TODAS LAS TABLAS** y las recrea con la estructura completa.  
**Perderás todos los datos actuales** a menos que hagas un respaldo.

---

## 📋 PASOS PARA EJECUTAR:

### 1. **Acceder a Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Inicia sesión en tu proyecto
   - Ve a la sección **SQL Editor** (icono de código)

### 2. **Ejecutar el Script**
   - Clic en **"+ New Query"**
   - Copia TODO el contenido de `SCHEMA_COMPLETO_SUPABASE.sql`
   - Pégalo en el editor SQL
   - Clic en **"RUN"** (botón verde)

### 3. **Verificar que funcionó**
   Deberías ver al final:
   ```
   ✅ 6 tablas creadas
   ✅ Índices creados
   ✅ Políticas RLS activadas
   ```

---

## 📊 TABLAS CREADAS:

1. **obligaciones** - Deudas y obligaciones
2. **user_operations** - Ingresos y gastos (CON metadata)
3. **user_inventory** - Productos y stock
4. **user_goals** - Meta principal
5. **user_goals_extra** - Metas adicionales
6. **user_profiles** - Perfiles de usuario

---

## ✅ COLUMNAS NUEVAS AGREGADAS:

### En `user_operations`:
- `metadata` (JSONB) - Para datos flexibles
- `cost_amount` - Costo real
- `tax_amount` - Impuestos
- `net_profit` - Ganancia neta
- `counterparty` - Proveedor/Cliente

### En `user_inventory`:
- `sku` - Código de producto
- `barcode` - Código de barras
- `description` - Descripción
- `min_stock` - Stock mínimo

### En `user_profiles`:
- `preferred_currency` - Moneda preferida
- `preferred_language` - Idioma preferido
- `timezone` - Zona horaria
- `settings` - Configuración adicional

---

## 🔒 SEGURIDAD:

- ✅ Row Level Security (RLS) activado en todas las tablas
- ✅ Solo el dueño puede ver/editar sus datos
- ✅ auth.uid() valida automáticamente

---

## 🆘 SI ALGO FALLA:

### Error: "relation already exists"
**Solución**: Las tablas ya existen. Puedes:
- Ejecutar solo la parte DROP al inicio
- O modificar las tablas existentes manualmente

### Error: "column does not exist"
**Solución**: Ejecuta este ALTER para agregar solo metadata:
```sql
ALTER TABLE user_operations ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
```

### Error con RLS
**Solución**: Desactiva temporalmente RLS:
```sql
ALTER TABLE user_operations DISABLE ROW LEVEL SECURITY;
```

---

## 📝 NOTAS:

- El script es seguro para ejecutar múltiples veces
- Si ya tienes datos, haz un RESPALDO primero
- Las políticas RLS protegen tus datos automáticamente
- El campo `metadata` resuelve el error actual

---

## 🎯 DESPUÉS DE EJECUTAR:

1. Actualiza tu navegador (Ctrl+F5)
2. Intenta registrar una operación
3. El error de "metadata" debería desaparecer
4. ¡Todo debería funcionar!
