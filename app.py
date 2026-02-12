from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta, datetime
import os
from dotenv import load_dotenv
from pathlib import Path

# 1. CARGA DEL BÚNKER (.ENV)
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)

# 2. SEGURIDAD (claves solo desde variables de entorno, nunca en código)
secret = os.getenv('SECRET_KEY')
if not secret or not secret.strip():
    raise RuntimeError("SECRET_KEY es obligatorio. Añádelo en Render > Environment o en .env")
app.secret_key = secret
app.permanent_session_lifetime = timedelta(days=36500)

# 3. CONEXIÓN (100% cloud - Supabase/PostgreSQL. Sin fallbacks locales)
database_url = os.getenv('DATABASE_URL')
if not database_url or not database_url.strip():
    raise RuntimeError("DATABASE_URL es obligatorio. Configúralo en Render o en .env para producción.")

# Pequeña corrección de formato (postgres:// -> postgresql://)
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
# ==============================================================================
# MODELOS DE DATOS (LA MEMORIA DE PYMAX)
# ==============================================================================

# --- TUS TABLAS ORIGINALES ---
class Obligacion(db.Model):
    __tablename__ = 'obligaciones'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50))
    tipo = db.Column(db.String(100), nullable=False)
    monto = db.Column(db.Float, nullable=False)
    fecha_vencimiento = db.Column(db.Date, nullable=False)
    estado = db.Column(db.String(20), default='pendiente')
    email_contacto = db.Column(db.String(100))

# --- TABLAS PARA LA IA Y FLUJO DE CAJA ---

class MetaUsuario(db.Model):
    __tablename__ = 'user_goals'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), unique=True, nullable=False)
    goal_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MetasAdicionales(db.Model):
    __tablename__ = 'user_goals_extra'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False)
    slot_number = db.Column(db.Integer, nullable=False) # Guardará 2 o 3
    goal_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Operacion(db.Model):
    __tablename__ = 'user_operations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    concept = db.Column(db.String(200))
    type = db.Column(db.String(50)) # 'ingreso' o 'gasto'
    category = db.Column(db.String(50))
    
    # --- NUEVAS COLUMNAS (INTELIGENCIA FINANCIERA) ---
    cost_amount = db.Column(db.Numeric(10, 2), default=0) # Costo real
    tax_amount = db.Column(db.Numeric(10, 2), default=0) # Impuestos
    net_profit = db.Column(db.Numeric(10, 2), default=0) # Ganancia Neta
    counterparty = db.Column(db.String(150)) # Proveedor/Cliente
    # -------------------------------------------------

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Inventario(db.Model):
    __tablename__ = 'user_inventory'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False)
    product_name = db.Column(db.String(150), nullable=False)
    current_stock = db.Column(db.Integer, default=0)
    
    # --- NUEVAS COLUMNAS (ECONOMÍA UNITARIA) ---
    cost_price = db.Column(db.Numeric(10, 2), default=0) # Precio Compra
    sale_price = db.Column(db.Numeric(10, 2), default=0) # Precio Venta
    tax_percent = db.Column(db.Numeric(5, 2), default=0) # % Impuesto
    supplier = db.Column(db.String(150)) # Proveedor
    # -------------------------------------------

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ==============================================================================
# RUTAS DE NAVEGACIÓN Y LOGICA DE NEGOCIO
# ==============================================================================

@app.route('/')
def index():
    if 'departamento' in session:
        if session['departamento'] == 'empresa':
            return redirect(url_for('empresa_home'))
        elif session['departamento'] == 'personal':
            return redirect(url_for('personal_home'))
    return render_template('index.html')

@app.route('/seleccion')
def seleccion():
    return render_template('seleccion.html')

@app.route('/configurar-preferencia/<tipo>')
def configurar_preferencia(tipo):
    session.permanent = True
    session['departamento'] = tipo
    
    if tipo == 'empresa':
        return redirect(url_for('empresa_home'))
    elif tipo == 'personal':
        return redirect(url_for('personal_home'))
    
    return redirect(url_for('index'))

@app.route('/reiniciar-sistema')
def reiniciar_sistema():
    session.pop('departamento', None)
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    """Limpia la sesión de Flask y redirige al inicio"""
    session.clear()  # Limpia TODA la sesión de Flask
    return redirect(url_for('index'))

# ==============================================================================
# DEPARTAMENTO: EMPRESA (Panel de Control)
# ==============================================================================

@app.route('/empresa')
def empresa_home():
    if session.get('departamento') != 'empresa':
        session['departamento'] = 'empresa'
    return render_template('empresa/index-empresa.html')

# --- MÓDULO 1: PLAN MOVER (Finanzas) ---

@app.route('/empresa/mover')
def mover_panel():
    return render_template('empresa/mover/panel-mover.html')

@app.route('/empresa/mover/ventas-gastos')
def mover_ventas():
    return render_template('empresa/mover/ventas-gastos.html')

@app.route('/empresa/mover/flujo-caja')
def mover_flujo():
    return render_template('empresa/mover/flujo-caja.html')

# GESTIÓN DE METAS
@app.route('/empresa/mover/metas')
def mover_metas():
    return render_template('empresa/mover/metas.html')

# AUDITORÍA (LIBRO MAYOR)
@app.route('/empresa/mover/auditoria')
def mover_auditoria():
    return render_template('empresa/mover/auditoria.html')

@app.route('/empresa/mover/obligaciones')
def mover_obligaciones():
    return render_template('empresa/mover/obligaciones.html')

@app.route('/empresa/mover/calendario')
def mover_calendario():
    return render_template('empresa/mover/calendario.html')

@app.route('/empresa/mover/semaforo')
def mover_semaforo():
    return render_template('empresa/mover/semaforo.html')

@app.route('/empresa/mover/ia-apoyo')
def mover_ia():
    return render_template('empresa/mover/ia-apoyo.html')

@app.route('/empresa/mover/progreso')
def mover_progreso():
    return render_template('empresa/mover/progreso.html')

@app.route('/empresa/mover/exportar')
def mover_exportar():
    return render_template('empresa/mover/exportar-excel.html')

# --- MÓDULO 4: INVENTARIO/STOCK (parte de MOVER) ---
@app.route('/empresa/mover/inventario')
def mover_inventario():
    return render_template('empresa/mover/inventario.html')

# ==============================================================================
# SERVICIO INDEPENDIENTE: TIBURÓN (CRM de Ventas)
# ==============================================================================

@app.route('/empresa/tiburon')
def tiburon_home():
    return render_template('empresa/tiburon/tiburon.html')

# ==============================================================================
# SERVICIO INDEPENDIENTE: HAMBRE (Sistema de Operaciones)
# ==============================================================================

@app.route('/empresa/hambre')
def hambre_home():
    return render_template('empresa/hambre/hambre.html')

# ==============================================================================
# API ENDPOINTS - WHATSAPP INTEGRATION
# ==============================================================================

@app.route('/api/whatsapp/webhook', methods=['POST', 'GET'])
def whatsapp_webhook():
    """
    Webhook para recibir mensajes de WhatsApp Business API
    POST: Recibe mensajes entrantes
    GET: Verificación inicial de WhatsApp
    """
    if request.method == 'GET':
        # Verificación de webhook (WhatsApp requirement)
        mode = request.args.get('hub.mode')
        token = request.args.get('hub.verify_token')
        challenge = request.args.get('hub.challenge')
        
        if mode == 'subscribe' and token == os.getenv('WHATSAPP_VERIFY_TOKEN'):
            return challenge, 200
        return 'Forbidden', 403
    
    # POST: Procesar mensaje entrante
    data = request.json
    # TODO: Implementar procesamiento de mensajes
    # Ver INTEGRACION_WHATSAPP_SII.md para detalles
    return jsonify({'status': 'received'}), 200

@app.route('/api/whatsapp/send', methods=['POST'])
def whatsapp_send():
    """Envía mensajes a usuarios vía WhatsApp"""
    # TODO: Implementar envío de mensajes
    return jsonify({'status': 'sent'}), 200

# ==============================================================================
# API ENDPOINTS - SII INTEGRATION
# ==============================================================================

@app.route('/api/sii/connect', methods=['POST'])
def sii_connect():
    """Conecta la cuenta SII del usuario"""
    # TODO: Implementar autenticación con SII
    # Ver INTEGRACION_WHATSAPP_SII.md para detalles
    return jsonify({'status': 'connected'}), 200

@app.route('/api/sii/sync', methods=['POST'])
def sii_sync():
    """Sincronización manual de facturas SII"""
    # TODO: Implementar sincronización SII
    return jsonify({'status': 'syncing'}), 200

@app.route('/api/sii/status', methods=['GET'])
def sii_status():
    """Estado de última sincronización SII"""
    # TODO: Retornar estado de sync
    return jsonify({'status': 'ready', 'last_sync': None}), 200

# ==============================================================================
# API ENDPOINTS - IA SERVICES
# ==============================================================================

@app.route('/api/ai/classify', methods=['POST'])
def ai_classify():
    """Clasifica una transacción usando IA"""
    # TODO: Implementar clasificación con GPT-4o
    return jsonify({'category': 'unknown'}), 200

@app.route('/api/ai/advice', methods=['POST'])
def ai_advice():
    """Genera consejo contextual basado en datos del usuario"""
    # TODO: Implementar generación de consejos IA
    return jsonify({'advice': 'pending'}), 200

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """Endpoint para conversación con IA en el panel web"""
    # TODO: Implementar chat IA
    return jsonify({'response': 'Hola, soy Pymax IA'}), 200

# ==============================================================================
# DEPARTAMENTO: PERSONAL
# ==============================================================================

@app.route('/personal')
def personal_home():
    if session.get('departamento') != 'personal':
        session['departamento'] = 'personal'
    return render_template('personal/index-personal.html')

@app.route('/personal/dashboard')
def personal_dashboard():
    """Dashboard personal - ruta usada por index.html al seleccionar rol personal"""
    if session.get('departamento') != 'personal':
        session['departamento'] = 'personal'
    return render_template('personal/index-personal.html')

# ==============================================================================
# ARRANQUE DEL SISTEMA
# ==============================================================================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("✅ SISTEMA ACTUALIZADO Y SEGURO")
    
    # Puerto dinámico para Render (PORT) o 5000 local
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)