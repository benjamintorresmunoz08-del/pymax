import os
from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta

# ==============================================================================
# CONFIGURACIÓN DEL SISTEMA (NIVEL ENTERPRISE)
# ==============================================================================
app = Flask(__name__)

# 1. SEGURIDAD: Llave maestra para encriptar las sesiones (Cookies)
# Esto hace que nadie pueda falsificar su identidad.
app.secret_key = 'CLAVE_MAESTRA_PYMAX_SEGURIDAD_TOTAL_2026' 
app.permanent_session_lifetime = timedelta(days=365) # La memoria dura 1 año

# 2. CONEXIÓN A BASE DE DATOS (SUPABASE)
# Esta es la línea que conecta tu código con la nube.
# IMPORTANTE: Si cambiaste la contraseña de Supabase, ponla aquí.
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:kedlO3vlVNh9luLO@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ==============================================================================
# MODELOS DE DATOS (LA MEMORIA)
# ==============================================================================
# Aquí definimos las tablas. Python las creará automáticamente en Supabase.

class Obligacion(db.Model):
    __tablename__ = 'obligaciones'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50)) # ID único del usuario (UUID)
    tipo = db.Column(db.String(100), nullable=False) # Ej: Proveedor, Impuesto
    monto = db.Column(db.Float, nullable=False)
    fecha_vencimiento = db.Column(db.Date, nullable=False)
    estado = db.Column(db.String(20), default='pendiente') # pendiente, pagada
    email_contacto = db.Column(db.String(100))

# (Aquí podrás agregar más tablas en el futuro para Tiburón y Hambre)

# ==============================================================================
# RUTAS DE NAVEGACIÓN Y LOGICA DE NEGOCIO
# ==============================================================================

# --- PORTADA Y REDIRECCIÓN INTELIGENTE ---
@app.route('/')
def index():
    # El cerebro verifica: ¿Ya conozco a este usuario?
    # Si ya eligió departamento, lo mandamos directo a su oficina.
    if 'departamento' in session:
        if session['departamento'] == 'empresa':
            return redirect(url_for('empresa_home'))
        elif session['departamento'] == 'personal':
            return redirect(url_for('personal_home'))
    # Si es nuevo, le mostramos la portada.
    return render_template('index.html')

@app.route('/seleccion')
def seleccion():
    return render_template('seleccion.html')

# --- GUARDADO DE PREFERENCIA (MEMORIA) ---
@app.route('/configurar-preferencia/<tipo>')
def configurar_preferencia(tipo):
    session.permanent = True
    session['departamento'] = tipo # Guardamos "empresa" o "personal" en la cookie
    
    if tipo == 'empresa':
        return redirect(url_for('empresa_home'))
    elif tipo == 'personal':
        return redirect(url_for('personal_home'))
    
    return redirect(url_for('index'))

@app.route('/reiniciar-sistema')
def reiniciar_sistema():
    # Borra la memoria para permitir elegir de nuevo (o cerrar sesión)
    session.pop('departamento', None)
    return redirect(url_for('index'))

# ==============================================================================
# DEPARTAMENTO: EMPRESA (Panel de Control)
# ==============================================================================

@app.route('/empresa')
def empresa_home():
    # Seguridad: Si intenta entrar aquí sin ser empresa, lo corregimos.
    if session.get('departamento') != 'empresa':
        session['departamento'] = 'empresa'
    return render_template('empresa/index-empresa.html')

# --- MÓDULO 1: PLAN MOVER (Finanzas) ---
# Todas las herramientas financieras viven bajo esta ruta.

@app.route('/empresa/mover')
def mover_panel():
    return render_template('empresa/mover/panel-mover.html')

@app.route('/empresa/mover/ventas-gastos')
def mover_ventas():
    return render_template('empresa/mover/ventas-gastos.html')

@app.route('/empresa/mover/flujo-caja')
def mover_flujo():
    return render_template('empresa/mover/flujo-caja.html')

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
# Preparado para el futuro. Ahora redirige al panel, pero pronto tendrá su propio home.
@app.route('/empresa/tiburon')
def tiburon():
    # TODO: Crear templates/empresa/tiburon/panel-tiburon.html
    return render_template('empresa/index-empresa.html')

# --- MÓDULO 3: HAMBRE (Operaciones - Placeholder) ---
@app.route('/empresa/hambre')
def hambre():
    # TODO: Crear templates/empresa/hambre/panel-hambre.html
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
    # Esto le dice a Python: "Si las tablas no existen en Supabase, créalas ahora"
    with app.app_context():
        db.create_all()
    
    # Modo Debug activado para desarrollo local, pero seguro para la nube.
    app.run(debug=True, port=5000)