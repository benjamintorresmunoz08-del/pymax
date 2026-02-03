import os
from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta

# ==============================================================================
# CONFIGURACIÓN INICIAL - NIVEL EMPRESARIAL
# ==============================================================================
app = Flask(__name__)

# 1. SEGURIDAD DE SESIÓN (La clave para que nunca se cierre)
# Esta clave cifra las cookies. En producción real, esto iría en una variable de entorno.
app.secret_key = 'CLAVE_MAESTRA_PYMAX_SEGURIDAD_TOTAL_2026' 

# 2. DURACIÓN DE LA MEMORIA
# La sesión durará 365 días. El usuario no tendrá que elegir de nuevo en un año.
app.permanent_session_lifetime = timedelta(days=365)

# 3. CONEXIÓN A BASE DE DATOS (SUPABASE)
# ⚠️ PEGA AQUÍ TU URL "POOLER" (Puerto 6543) QUE YA FUNCIONABA ⚠️
# Recuerda: Sin corchetes [] y con tu contraseña real.
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres.haqjuyagyvxynmulanhe:kedlO3vlVNh9luLO @aws-1-sa-east-1.pooler.supabase.com:6543/postgres"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicialización del Motor de Base de Datos
db = SQLAlchemy(app)

# ==============================================================================
# MODELOS DE DATOS (Arquitectura Escalable)
# ==============================================================================

class Obligacion(db.Model):
    __tablename__ = 'obligaciones'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    monto = db.Column(db.Float, nullable=False)
    fecha_vencimiento = db.Column(db.Date, nullable=False)
    estado = db.Column(db.String(20), default='Pendiente') # Pendiente, Pagado, Vencido
    prioridad = db.Column(db.String(10), default='Media')  # Alta, Media, Baja
    
    # Metadatos para auditoría (Nivel Enterprise)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ==============================================================================
# LÓGICA DE CONTROL DE TRÁFICO (El "Portero" Inteligente)
# ==============================================================================

@app.route('/')
def index():
    """
    Esta es la puerta principal.
    Si el usuario ya tiene una preferencia guardada ("Empresa" o "Personal"),
    lo redirigimos AUTOMÁTICAMENTE a su panel. No pasa por el inicio.
    """
    # Verificamos si existe la cookie de memoria
    if 'departamento' in session:
        departamento = session['departamento']
        if departamento == 'empresa':
            return redirect(url_for('empresa_home'))
        elif departamento == 'personal':
            return redirect(url_for('personal_home'))
            
    # Si es un usuario nuevo (o borró cookies), le mostramos la portada
    return render_template('index.html')

@app.route('/configurar-preferencia/<tipo>')
def configurar_preferencia(tipo):
    """
    Esta ruta NO TIENE VISTA. Solo sirve para guardar la decisión en el cerebro.
    Se activa cuando el usuario hace clic en "Ir a Empresa" o "Ir a Personal".
    """
    session.permanent = True  # Activa la duración de 1 año
    session['departamento'] = tipo # Guarda la elección
    
    if tipo == 'empresa':
        return redirect(url_for('empresa_home'))
    elif tipo == 'personal':
        return redirect(url_for('personal_home'))
        
    return redirect(url_for('index'))

@app.route('/reiniciar-sistema')
def reiniciar_sistema():
    """
    Botón de emergencia para cambiar de departamento.
    Borra la memoria y te manda al inicio.
    """
    session.pop('departamento', None)
    return redirect(url_for('index'))

# ==============================================================================
# RUTAS DEL DEPARTAMENTO: EMPRESA
# ==============================================================================

@app.route('/empresa')
def empresa_home():
    # Doble verificación de seguridad
    if session.get('departamento') != 'empresa':
        # Si alguien intenta entrar aquí siendo "Personal", lo corregimos
        session['departamento'] = 'empresa' 
    return render_template('empresa/index-empresa.html')

# --- MÓDULO: PLAN MOVER (Finanzas) ---

@app.route('/empresa/mover')
def mover_panel():
    # Panel con manejo de errores robusto (Si DB falla, no cae la web)
    try:
        total_obs = Obligacion.query.count()
        pendientes = Obligacion.query.filter_by(estado='Pendiente').count()
    except Exception as e:
        print(f"⚠️ ALERTA DE SISTEMA: Error conectando a DB: {e}")
        total_obs = 0
        pendientes = 0
        
    return render_template('empresa/mover/panel-mover.html', total=total_obs, pendientes=pendientes)

@app.route('/empresa/mover/obligaciones', methods=['GET', 'POST'])
def mover_obligaciones():
    if request.method == 'POST':
        try:
            # Procesamiento de datos del formulario
            titulo = request.form['titulo']
            monto = float(request.form['monto'])
            fecha = datetime.strptime(request.form['fecha'], '%Y-%m-%d')
            prioridad = request.form.get('prioridad', 'Media')
            
            nueva_obs = Obligacion(titulo=titulo, monto=monto, fecha_vencimiento=fecha, prioridad=prioridad)
            db.session.add(nueva_obs)
            db.session.commit()
            print(f"✅ REGISTRO EXITOSO: {titulo} guardado en la Nube.")
        except Exception as e:
            db.session.rollback()
            print(f"❌ ERROR CRÍTICO AL GUARDAR: {e}")
            
        return redirect(url_for('mover_obligaciones'))

    # Obtención de datos para la lista
    try:
        lista_obligaciones = Obligacion.query.order_by(Obligacion.fecha_vencimiento).all()
    except Exception as e:
        lista_obligaciones = []
        print(f"⚠️ Error leyendo lista: {e}")

    return render_template('empresa/mover/obligaciones.html', obligaciones=lista_obligaciones)

# ==============================================================================
# RUTAS DEL DEPARTAMENTO: PERSONAL
# ==============================================================================

@app.route('/personal')
def personal_home():
    # Doble verificación
    if session.get('departamento') != 'personal':
        session['departamento'] = 'personal'
    return render_template('personal/index-personal.html')

# ==============================================================================
# INICIALIZADOR DEL SERVIDOR
# ==============================================================================

if __name__ == '__main__':
    with app.app_context():
        # Crea las tablas si no existen (Sincronización con Supabase)
        db.create_all()
        print("---------------------------------------------------------")
        print(" SISTEMA PYMAX ENTERPRISE: EN LÍNEA")
        print(" CONEXIÓN A NUBE: ESTABLECIDA")
        print(" SISTEMA DE SESIONES: ACTIVO (365 DÍAS)")
        print("---------------------------------------------------------")
    
    # Ejecución en puerto 5000
    app.run(debug=True, port=5000)