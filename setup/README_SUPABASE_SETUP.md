# 📋 Guía de Configuración de Supabase para PYMAX

## 🎯 Tabla: user_business_profiles

Esta tabla almacena la configuración del onboarding y preferencias de cada usuario.

### 🚀 Instalación

**Opción 1: Desde el Dashboard de Supabase**

1. Ir a tu proyecto en [https://supabase.com](https://supabase.com)
2. Click en **SQL Editor** en el menú lateral
3. Click en **New Query**
4. Copiar y pegar el contenido de `CREATE_USER_BUSINESS_PROFILES.sql`
5. Click en **Run** para ejecutar

**Opción 2: Desde la CLI de Supabase**

```bash
supabase db push setup/CREATE_USER_BUSINESS_PROFILES.sql
```

### 📊 Estructura de la Tabla

```sql
user_business_profiles
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → auth.users)
├── business_type (VARCHAR(50)) - 'tecnico' | 'gastronomia' | 'profesional' | 'bienestar' | 'retail'
├── business_name (VARCHAR(255))
├── industry_label (VARCHAR(100))
├── onboarding_completed (BOOLEAN)
├── onboarding_step (INTEGER)
├── onboarding_completed_at (TIMESTAMP)
├── dashboard_config (JSONB)
├── widget_preferences (JSONB)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### 🔒 Seguridad (RLS)

La tabla tiene **Row Level Security** habilitado con 4 políticas:

1. ✅ **SELECT**: Los usuarios pueden ver solo su propio perfil
2. ✅ **INSERT**: Los usuarios pueden crear solo su propio perfil
3. ✅ **UPDATE**: Los usuarios pueden actualizar solo su propio perfil
4. ✅ **DELETE**: Los usuarios pueden eliminar solo su propio perfil

### 📝 Ejemplo de Uso desde JavaScript

```javascript
// Obtener perfil del usuario actual
const { data: profile } = await supabase
  .from('user_business_profiles')
  .select('*')
  .eq('user_id', user.id)
  .single();

// Crear o actualizar perfil (UPSERT)
const { data, error } = await supabase
  .from('user_business_profiles')
  .upsert({
    user_id: user.id,
    business_type: 'tecnico',
    business_name: 'Taller El Rayo',
    onboarding_completed: true,
    dashboard_config: {
      currency: 'CLP',
      contact_email: 'contacto@email.com'
    }
  }, { onConflict: 'user_id' });
```

### 🔍 Verificación

Después de ejecutar el script SQL, verifica que todo esté correcto:

```sql
-- Ver estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_business_profiles';

-- Ver políticas RLS
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'user_business_profiles';

-- Ver cantidad de registros
SELECT COUNT(*) FROM user_business_profiles;
```

### 🎨 Campos JSON

**dashboard_config** puede contener:
```json
{
  "currency": "CLP",
  "contact_email": "user@example.com",
  "theme": "light",
  "notifications_enabled": true
}
```

**widget_preferences** puede contener:
```json
{
  "visible_widgets": ["inventario-maestro", "semaforo-pymax"],
  "widget_order": [1, 2, 3, 4],
  "collapsed_sections": []
}
```

### ⚠️ Troubleshooting

**Error: "permission denied for table user_business_profiles"**
- Verifica que RLS esté habilitado
- Verifica que las políticas existan
- Verifica que el usuario esté autenticado

**Error: "duplicate key value violates unique constraint"**
- Ya existe un perfil para ese user_id
- Usa UPSERT en lugar de INSERT

**Error: "new row violates check constraint"**
- El `business_type` debe ser uno de: 'tecnico', 'gastronomia', 'profesional', 'bienestar', 'retail'

### 📚 Referencias

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

💡 **Tip**: Ejecuta este script en un ambiente de desarrollo primero antes de aplicarlo a producción.
