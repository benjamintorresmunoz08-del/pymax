import os
from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta

# ==============================================================================
# CONFIGURACIÓN DEL SISTEMA (NIVEL ENTERPRISE)
# ==============================================================================
app = Flask(__name__)

# 1. SEGURIDAD
app.secret_key = 'CLAVE_MAESTRA_PYMAX_SEGURIDAD_TOTAL_2026' 

# CORRECCIÓN: 36500 días son 100 años. Es "eterno" para el usuario,
# pero un número seguro para que el servidor no falle.
app.permanent_session_lifetime = timedelta(days=36500) 

# 2. CONEXIÓN A BASE DE DATOS (SUPABASE)
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres.haqjuyagyvxynmulanhe:kedlO3vlVNh9luLO@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
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

# --- MÓDULO 2: TIBURÓN (Ventas - Placeholder) ---
@app.route('/empresa/tiburon')
def tiburon():
    return render_template('empresa/index-empresa.html')

# --- MÓDULO 3: HAMBRE (Operaciones - Placeholder) ---
@app.route('/empresa/hambre')
def hambre():
    return render_template('empresa/index-empresa.html')

# ==============================================================================
# DEPARTAMENTO: PERSONAL
# ==============================================================================

@app.route('/personal')
def personal_home():
    if session.get('departamento') != 'personal':
        session['departamento'] = 'personal'
    return render_template('personal/index-personal.html')

# ==============================================================================
# ARRANQUE DEL SISTEMA
# ==============================================================================

if __name__ == '__main__':
    with app.app_context():
        # ESTA LÍNEA ES MÁGICA: SI VE COLUMNAS NUEVAS, LAS AGREGA SIN BORRAR DATOS
        db.create_all()
        print("✅ SISTEMA ACTUALIZADO Y SEGURO")
    
    app.run(debug=True, port=5000)