from flask import Flask, render_template, request, redirect, url_for, session
from datetime import timedelta
import os
from dotenv import load_dotenv
from pathlib import Path

# CARGA DEL .ENV
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)

# SEGURIDAD
secret = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.secret_key = secret
app.permanent_session_lifetime = timedelta(days=365)

# CONFIGURACIÓN SUPABASE (para pasar a templates)
# Si no están en Render Environment, usa fallback para que la app funcione
_SUPABASE_DEFAULT_URL = 'https://haqjuyagyvxynmulanhe.supabase.co'
_SUPABASE_DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcWp1eWFneXZ4eW5tdWxhbmhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjU0MjQsImV4cCI6MjA4MTQwMTQyNH0.3aSIfr3s5spESzEv_UAaqYkJzVyhbkK8ZpSlExY0A3g'

# Acepta múltiples nombres de variables (Render, Supabase, etc.)
SUPABASE_URL = (os.getenv('SUPABASE_URL') or '').strip() or _SUPABASE_DEFAULT_URL
SUPABASE_KEY = (
    (os.getenv('SUPABASE_KEY') or os.getenv('ANON_KEY') or 
     os.getenv('SUPABASE_ANON_KEY') or '').strip() or _SUPABASE_DEFAULT_KEY
)

# Context processor para hacer las variables disponibles en todos los templates
@app.context_processor
def inject_config():
    return {
        'SUPABASE_URL': SUPABASE_URL,
        'SUPABASE_KEY': SUPABASE_KEY
    }

# ==============================================================================
# RUTAS PRINCIPALES
# ==============================================================================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/personal')
def personal_home():
    return render_template('personal/index-personal.html')

@app.route('/empresa')
def empresa_home():
    return render_template('empresa/index-empresa.html')

# ==============================================================================
# RUTAS ESSENTIAL (Plan Essential - El Cimiento de Hierro)
# ==============================================================================

@app.route('/empresa/essential')
def essential_panel():
    return render_template('empresa/essential/panel-essential.html')

@app.route('/empresa/essential/ventas-gastos')
def essential_ventas():
    return render_template('empresa/essential/ventas-gastos.html')

@app.route('/empresa/essential/flujo')
def essential_flujo():
    return render_template('empresa/essential/flujo-caja.html')

@app.route('/empresa/essential/deudas')
def essential_deudas():
    return render_template('empresa/essential/deudas.html')

@app.route('/empresa/essential/metas')
def essential_metas():
    return render_template('empresa/essential/metas.html')

@app.route('/empresa/essential/inventario')
def essential_inventario():
    return render_template('empresa/essential/inventario.html')

@app.route('/empresa/essential/auditoria')
def essential_auditoria():
    return render_template('empresa/essential/auditoria.html')

@app.route('/empresa/essential/semaforo')
def essential_semaforo():
    return render_template('empresa/essential/semaforo.html')

@app.route('/empresa/essential/progreso')
def essential_progreso():
    return render_template('empresa/essential/progreso.html')

@app.route('/empresa/essential/calendario')
def essential_calendario():
    return render_template('empresa/essential/calendario.html')

@app.route('/empresa/essential/ia-apoyo')
def essential_ia():
    return render_template('empresa/essential/ia-apoyo.html')

@app.route('/empresa/essential/exportar-excel')
def essential_export_excel():
    return render_template('empresa/essential/exportar-excel.html')

# Nuevas herramientas del Plan Essential
@app.route('/empresa/essential/fuga-dinero')
def essential_fuga_dinero():
    return render_template('empresa/essential/fuga-dinero.html')

@app.route('/empresa/essential/punto-equilibrio')
def essential_punto_equilibrio():
    return render_template('empresa/essential/punto-equilibrio.html')

@app.route('/empresa/essential/boveda-documentos')
def essential_boveda():
    return render_template('empresa/essential/boveda-documentos.html')

@app.route('/empresa/essential/orden-express')
def essential_orden_express():
    return render_template('empresa/essential/orden-express.html')

@app.route('/empresa/essential/comunidad-starter')
def essential_comunidad():
    return render_template('empresa/essential/comunidad-starter.html')

# ==============================================================================
# RUTAS ONBOARDING (Configuración inicial del negocio)
# ==============================================================================

@app.route('/empresa/onboarding')
def onboarding_business_selector():
    """Paso 1: Selección del tipo de negocio"""
    return render_template('empresa/onboarding/business-selector.html')

@app.route('/empresa/onboarding/config')
def onboarding_config():
    """Paso 2: Configuración básica del negocio"""
    return render_template('empresa/onboarding/config-wizard.html')

@app.route('/empresa/onboarding/loading')
def onboarding_loading():
    """Paso 3: Pantalla de carga con animación"""
    return render_template('empresa/onboarding/loading-animation.html')

# ==============================================================================
# RUTAS MOVER (Deprecated - Redirige a Essential)
# ==============================================================================

@app.route('/empresa/mover')
def mover_panel():
    return redirect(url_for('essential_panel'))

# ==============================================================================
# RUTAS TIBURÓN (CRM Premium)
# ==============================================================================

@app.route('/empresa/tiburon')
def tiburon():
    return render_template('empresa/tiburon/tiburon.html')

# ==============================================================================
# RUTAS HAMBRE (Operations Premium)
# ==============================================================================

@app.route('/empresa/hambre')
def hambre():
    return render_template('empresa/hambre/hambre.html')

# ==============================================================================
# ERROR HANDLERS
# ==============================================================================

@app.errorhandler(404)
def page_not_found(e):
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(e):
    return render_template('index.html'), 500

# ==============================================================================
# RUN
# ==============================================================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
