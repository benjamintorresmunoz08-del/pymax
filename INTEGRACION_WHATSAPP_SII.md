# INTEGRACIÓN WHATSAPP + SII - ARQUITECTURA TÉCNICA

## OBJETIVO CENTRAL:
Automatizar el 90% del registro financiero mediante:
1. **WhatsApp Business API** - Entrada de datos por voz/texto
2. **API SII Chile** - Sincronización automática de facturas/boletas

---

## PARTE 1: INTEGRACIÓN WHATSAPP BUSINESS

### ARQUITECTURA TÉCNICA

```
Usuario (WhatsApp)
    |
    | (Audio/Texto/Foto)
    |
    v
WhatsApp Business API
    |
    | (Webhook POST)
    |
    v
Backend Flask (Pymax)
    |
    +---> /api/whatsapp/webhook
    |
    +---> Procesamiento según tipo:
          |
          +--> Audio ---> OpenAI Whisper (Speech-to-Text)
          |                    |
          |                    v
          |              GPT-4o (Clasificación + Extracción)
          |                    |
          |                    v
          |              Registro en Supabase
          |
          +--> Texto ---> GPT-4o (Clasificación directa)
          |                    |
          |                    v
          |              Registro en Supabase
          |
          +--> Foto ---> Google Vision OCR
                              |
                              v
                        Extracción de datos (monto, fecha, comercio)
                              |
                              v
                        GPT-4o (Clasificación)
                              |
                              v
                        Registro en Supabase
    |
    v
Respuesta a Usuario (WhatsApp)
```

### FLUJO DETALLADO

#### 1. Usuario envía audio de voz:
```
"Vendí 150 lucas a Distribuidora XYZ"
```

#### 2. Backend recibe webhook:
```python
@app.route('/api/whatsapp/webhook', methods=['POST'])
def whatsapp_webhook():
    data = request.json
    
    # Obtener datos del mensaje
    from_number = data['from']
    message_type = data['type']  # audio, text, image
    
    # Verificar usuario en DB
    user = get_user_by_phone(from_number)
    if not user:
        return send_whatsapp_message(from_number, 
            "No tienes cuenta activa en Pymax. Regístrate en pymax.cl")
    
    # Procesar según tipo
    if message_type == 'audio':
        return process_audio_message(data, user)
    elif message_type == 'text':
        return process_text_message(data, user)
    elif message_type == 'image':
        return process_image_message(data, user)
```

#### 3. Procesar audio:
```python
def process_audio_message(data, user):
    # Descargar audio de WhatsApp
    audio_url = data['audio']['url']
    audio_file = download_audio(audio_url)
    
    # Transcribir con Whisper
    transcription = openai.Audio.transcribe(
        model="whisper-1",
        file=audio_file,
        language="es"
    )
    
    text = transcription['text']
    # "Vendí 150 lucas a Distribuidora XYZ"
    
    # Clasificar con GPT-4o
    classification = classify_transaction(text, user)
    
    # {
    #   'type': 'ingreso',
    #   'amount': 150000,
    #   'concept': 'Venta a Distribuidora XYZ',
    #   'category': 'Ventas Corporativas',
    #   'counterparty': 'Distribuidora XYZ',
    #   'confidence': 0.95
    # }
    
    # Guardar en Supabase
    operation_id = save_operation(user, classification)
    
    # Responder al usuario
    send_whatsapp_message(
        user.phone,
        f"Registrado correctamente\n\n"
        f"Ingreso: ${format_money(150000)}\n"
        f"Concepto: Venta a Distribuidora XYZ\n"
        f"Categoría: Ventas Corporativas\n\n"
        f"Tu caja actualizada: ${format_money(user.caja_actual)}"
    )
    
    # Si es plan Tiburón o Hambre, enviar consejo IA
    if user.subscription_tier in ['tiburon', 'hambre']:
        advice = generate_ai_advice(user, classification)
        send_whatsapp_message(user.phone, advice)
```

#### 4. Función de clasificación IA:
```python
def classify_transaction(text, user):
    # Obtener contexto del usuario (últimas transacciones, patrones)
    context = get_user_context(user)
    
    prompt = f"""
    Eres un asistente financiero experto en contabilidad chilena.
    
    Usuario: {user.name}
    Rubro: {user.industry}
    
    Últimas transacciones similares:
    {context}
    
    Mensaje del usuario:
    "{text}"
    
    Extrae y clasifica esta transacción.
    
    Responde en JSON:
    {{
        "type": "ingreso" | "egreso",
        "amount": numero (sin puntos ni símbolos),
        "concept": "descripción clara",
        "category": "categoría contable",
        "counterparty": "cliente o proveedor" (si aplica),
        "confidence": 0.0 a 1.0
    }}
    
    Notas:
    - "lucas" = miles de pesos ($1.000)
    - "palo" = millones de pesos ($1.000.000)
    - Si el monto es ambiguo, pregunta
    - Si falta información crítica, marcalo con confidence < 0.7
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)
```

### CASOS DE USO AVANZADOS

#### Caso 1: Conversación Natural
```
Usuario: "Gasté como 80 lucas"

IA: En qué gastaste esos $80.000? 
    Necesito el concepto para clasificarlo correctamente.

Usuario (audio): "En bencina para los repartos"

IA: Perfecto.

    Egreso registrado: $80.000
    Concepto: Combustible para repartos
    Categoría: Logística
    
    Llevas $240.000 en combustible este mes.
    Promedio últimos 3 meses: $180.000
    
    Alerta: Gasto aumentó 33%
    
    Causas posibles:
    1. Más repartos (normal si vendes más)
    2. Precio bencina subió
    3. Rutas ineficientes
    
    Revisamos?
    [Responde "sí" o "no"]
```

#### Caso 2: Foto de Boleta
```
Usuario: [Envía foto de boleta de Sodimac]

IA: [Procesa con OCR]
    
    Detecté:
    Comercio: Sodimac
    Monto: $45.670
    Fecha: Hoy
    
    Categoría sugerida: Insumos
    
    Es correcto?
    [Responde "sí" para confirmar o "no" para editar]
```

#### Caso 3: Recordatorios Proactivos
```
IA (notificación automática - 09:00 AM):

Buenos días Benjamín.

Tienes una deuda de $300.000 que vence MAÑANA
(Banco ABC - Línea de crédito)

Tu caja actual: $3.500.000

Recomendación: Pagar hoy y evitar interés de mora de $15.000/día

Quieres que programe el pago?
[Responde "sí" o "más info"]
```

---

## PARTE 2: INTEGRACIÓN SII (Servicio de Impuestos Internos)

### ARQUITECTURA TÉCNICA

```
Pymax Backend
    |
    | (Cada 6 horas - CRON Job)
    |
    v
API SII Chile
    |
    +---> /sii/auth (Login con certificado digital)
    |
    +---> /sii/dte/emitidos (Facturas emitidas)
    |         |
    |         v
    |    Parser XML + Validación
    |         |
    |         v
    |    Clasificación automática
    |         |
    |         v
    |    Registro en user_operations (tipo: ingreso)
    |
    +---> /sii/dte/recibidos (Facturas recibidas)
              |
              v
         Parser XML + Validación
              |
              v
         Clasificación automática
              |
              v
         Registro en user_operations (tipo: egreso)
```

### FLUJO DETALLADO

#### 1. Autenticación con SII:
```python
def authenticate_sii(user):
    # Usuario debe tener configurado:
    # - RUT
    # - Clave tributaria (encriptada)
    # - Certificado digital (opcional para empresas)
    
    payload = {
        'rut': user.rut,
        'password': decrypt(user.sii_password)
    }
    
    response = requests.post(
        'https://maullin.sii.cl/cgi_dte/UPL/DTEUpload',
        data=payload
    )
    
    return response.json()['token']
```

#### 2. Sincronizar facturas emitidas (Ventas):
```python
def sync_sii_emitidas(user):
    token = authenticate_sii(user)
    
    # Obtener facturas de los últimos 30 días
    response = requests.get(
        'https://www4.sii.cl/consdcvinternetui/services/data/facadeService/getEmitidas',
        headers={'Authorization': f'Bearer {token}'},
        params={
            'rut': user.rut,
            'desde': (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
            'hasta': datetime.now().strftime('%Y-%m-%d')
        }
    )
    
    facturas = response.json()
    
    for factura in facturas:
        # Verificar si ya existe
        exists = check_operation_exists(user, 
            reference=f"SII-{factura['folio']}")
        
        if exists:
            continue
        
        # Extraer datos
        data = {
            'user_id': user.id,
            'type': 'ingreso',
            'amount': factura['monto_total'],
            'concept': f"Venta según Factura #{factura['folio']}",
            'category': classify_with_ai(factura),
            'counterparty': factura['razon_social_receptor'],
            'tax_amount': factura['iva'],
            'net_profit': factura['monto_neto'],
            'reference': f"SII-{factura['folio']}",
            'created_at': factura['fecha_emision']
        }
        
        # Guardar
        save_operation(data)
        
        # Notificar al usuario
        send_notification(user, 
            f"Nueva venta sincronizada desde SII: ${format_money(factura['monto_total'])}")
```

#### 3. Sincronizar facturas recibidas (Compras):
```python
def sync_sii_recibidas(user):
    # Similar a emitidas, pero para egresos
    token = authenticate_sii(user)
    
    response = requests.get(
        'https://www4.sii.cl/consdcvinternetui/services/data/facadeService/getRecibidas',
        headers={'Authorization': f'Bearer {token}'},
        params={
            'rut': user.rut,
            'desde': (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
            'hasta': datetime.now().strftime('%Y-%m-%d')
        }
    )
    
    facturas = response.json()
    
    for factura in facturas:
        exists = check_operation_exists(user, 
            reference=f"SII-{factura['folio']}")
        
        if exists:
            continue
        
        data = {
            'user_id': user.id,
            'type': 'egreso',
            'amount': factura['monto_total'],
            'concept': f"Compra según Factura #{factura['folio']}",
            'category': classify_with_ai(factura),
            'counterparty': factura['razon_social_emisor'],
            'tax_amount': factura['iva'],
            'cost_amount': factura['monto_neto'],
            'reference': f"SII-{factura['folio']}",
            'created_at': factura['fecha_emision']
        }
        
        save_operation(data)
        
        send_notification(user, 
            f"Nueva compra sincronizada desde SII: ${format_money(factura['monto_total'])}")
```

#### 4. Validación Cruzada Automática:
```python
def validate_cross_check(user):
    """
    Compara datos registrados manualmente vs. datos del SII
    Detecta discrepancias y alerta al usuario
    """
    
    # Obtener operaciones del mes actual
    manual_ops = get_manual_operations(user, current_month)
    sii_ops = get_sii_operations(user, current_month)
    
    # Calcular totales
    manual_total = sum([op.amount for op in manual_ops])
    sii_total = sum([op.amount for op in sii_ops])
    
    discrepancy = abs(manual_total - sii_total)
    
    if discrepancy > 0:
        # Alerta al usuario
        send_whatsapp_message(user.phone,
            f"ALERTA DE VALIDACIÓN\n\n"
            f"Detecté una diferencia entre tus registros y el SII:\n\n"
            f"Tu registro: ${format_money(manual_total)}\n"
            f"SII dice: ${format_money(sii_total)}\n"
            f"Diferencia: ${format_money(discrepancy)}\n\n"
            f"Posibles causas:\n"
            f"1. Olvidaste registrar operaciones\n"
            f"2. Hay facturas sin boleta\n"
            f"3. Error en digitación\n\n"
            f"Reviso los detalles? [Responde 'sí']"
        )
```

### CONFIGURACIÓN INICIAL (Onboarding)

```
Primera vez que el usuario conecta SII:

1. Pymax solicita:
   - RUT de la empresa
   - Clave tributaria SII
   - Autorización para acceder a DTEs
   
2. Validación:
   - Pymax hace una prueba de conexión
   - Descarga 1 factura de prueba
   - Confirma que todo funciona
   
3. Programación:
   - Sincronización cada 6 horas
   - Notificaciones solo de nuevas facturas
   - Validación cruzada mensual automática
```

---

## PARTE 3: ARQUITECTURA BACKEND

### NUEVOS ENDPOINTS

```python
# ==========================================
# WHATSAPP ENDPOINTS
# ==========================================

@app.route('/api/whatsapp/webhook', methods=['POST'])
def whatsapp_webhook():
    """Recibe mensajes de WhatsApp"""
    pass

@app.route('/api/whatsapp/send', methods=['POST'])
def whatsapp_send():
    """Envía mensajes a usuarios"""
    pass

@app.route('/api/whatsapp/status', methods=['POST'])
def whatsapp_status():
    """Recibe confirmaciones de entrega"""
    pass

# ==========================================
# SII ENDPOINTS
# ==========================================

@app.route('/api/sii/connect', methods=['POST'])
def sii_connect():
    """Conecta cuenta SII del usuario"""
    pass

@app.route('/api/sii/sync', methods=['POST'])
def sii_sync_manual():
    """Sincronización manual (fuerza ahora)"""
    pass

@app.route('/api/sii/status', methods=['GET'])
def sii_status():
    """Estado de última sincronización"""
    pass

@app.route('/api/sii/validate', methods=['GET'])
def sii_validate():
    """Validación cruzada vs. registros manuales"""
    pass

# ==========================================
# IA ENDPOINTS (Para ambos)
# ==========================================

@app.route('/api/ai/classify', methods=['POST'])
def ai_classify():
    """Clasifica una transacción con IA"""
    pass

@app.route('/api/ai/advice', methods=['POST'])
def ai_advice():
    """Genera consejo contextual"""
    pass

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """Conversación con IA (para panel web)"""
    pass
```

### CRON JOBS

```python
# En un archivo separado: tasks.py

from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

# Sincronizar SII cada 6 horas
@scheduler.scheduled_job('interval', hours=6)
def sync_all_sii():
    users = get_users_with_sii_enabled()
    for user in users:
        try:
            sync_sii_emitidas(user)
            sync_sii_recibidas(user)
        except Exception as e:
            log_error(f"Error syncing SII for user {user.id}: {e}")

# Validación cruzada mensual
@scheduler.scheduled_job('cron', day=1, hour=9)
def monthly_validation():
    users = get_users_with_sii_enabled()
    for user in users:
        try:
            validate_cross_check(user)
        except Exception as e:
            log_error(f"Error validating user {user.id}: {e}")

# Alertas de obligaciones (diarias a las 9 AM)
@scheduler.scheduled_job('cron', hour=9)
def daily_obligations_alert():
    users = get_all_active_users()
    for user in users:
        try:
            check_upcoming_obligations(user)
        except Exception as e:
            log_error(f"Error checking obligations for user {user.id}: {e}")

scheduler.start()
```

---

## PARTE 4: SEGURIDAD Y PRIVACIDAD

### ENCRIPTACIÓN DE CREDENCIALES

```python
from cryptography.fernet import Fernet
import os

# Generar clave única por usuario
def encrypt_sii_password(user, password):
    # Usar SECRET_KEY + user.id para generar clave única
    key = derive_key(os.getenv('SECRET_KEY'), user.id)
    f = Fernet(key)
    
    encrypted = f.encrypt(password.encode())
    
    # Guardar en DB
    user.sii_password_encrypted = encrypted
    user.save()

def decrypt_sii_password(user):
    key = derive_key(os.getenv('SECRET_KEY'), user.id)
    f = Fernet(key)
    
    decrypted = f.decrypt(user.sii_password_encrypted)
    return decrypted.decode()
```

### LOGS DE AUDITORÍA

```python
# Tabla nueva en Supabase
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

# Cada acción sensible se registra
def log_audit(user, action, resource=None):
    supabase.table('audit_log').insert({
        'user_id': user.id,
        'action': action,
        'resource': resource,
        'ip_address': request.remote_addr,
        'user_agent': request.headers.get('User-Agent')
    }).execute()
```

---

## PARTE 5: ROADMAP DE IMPLEMENTACIÓN

### FASE 1: WhatsApp Básico (Mes 1)
- [ ] Configurar WhatsApp Business API
- [ ] Webhook básico (recibir mensajes)
- [ ] Transcripción con Whisper
- [ ] Clasificación simple con GPT-4o
- [ ] Registro en Supabase
- [ ] Respuesta automática

### FASE 2: WhatsApp Avanzado (Mes 2)
- [ ] OCR de boletas (fotos)
- [ ] Conversaciones contextuales
- [ ] Recordatorios proactivos
- [ ] Notificaciones inteligentes
- [ ] Multi-idioma (español chileno)

### FASE 3: SII Básico (Mes 3)
- [ ] Autenticación con SII
- [ ] Sincronización de facturas emitidas
- [ ] Sincronización de facturas recibidas
- [ ] Parser de XML DTEs
- [ ] Registro automático

### FASE 4: SII Avanzado (Mes 4)
- [ ] Validación cruzada
- [ ] Alertas de discrepancias
- [ ] Proyección de IVA a pagar
- [ ] Cálculo automático de impuestos
- [ ] Reporte tributario mensual

### FASE 5: IA Integrada (Mes 5)
- [ ] Consejos contextuales WhatsApp
- [ ] Análisis predictivo con datos SII
- [ ] Detección de anomalías
- [ ] Sugerencias de optimización fiscal
- [ ] Asistente virtual completo

---

## PARTE 6: COSTOS REALES

### WhatsApp Business API
- Conversaciones iniciadas por negocio: $0.05 USD c/u
- Conversaciones iniciadas por usuario: GRATIS
- Promedio: ~$10 USD/mes por 200 usuarios activos

### OpenAI
- Whisper (transcripción): $0.006 por minuto
- GPT-4o (clasificación): $0.005 por request
- Promedio: ~$50 USD/mes por 1000 transacciones/mes

### Google Cloud Vision (OCR)
- $1.50 por 1000 imágenes
- Promedio: ~$5 USD/mes por 300 boletas/mes

### SII (Servicio Oficial)
- GRATIS (API pública del gobierno)

### TOTAL ESTIMADO:
- **$65 USD/mes** para 200 usuarios activos
- **$0.32 USD por usuario/mes**

---

## CONCLUSIÓN

Esta arquitectura permite:

1. Entrada de datos 90% automática
2. Validación cruzada con fuente oficial (SII)
3. Conversación natural con IA
4. Sincronización en tiempo real
5. Seguridad nivel bancario

El usuario solo digitará manualmente lo que NO esté en:
- WhatsApp (gastos menores, efectivo)
- SII (facturas electrónicas)

TODO LO DEMÁS ES AUTOMÁTICO.
