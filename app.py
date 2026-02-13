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

@app.route('/onboarding')
def onboarding():
    return render_template('onboarding.html')

# ==============================================================================
# RUTAS MOVER (Servicio Básico)
# ==============================================================================

@app.route('/empresa/mover')
def mover_panel():
    return render_template('empresa/mover/panel-mover.html')

@app.route('/empresa/mover/ventas-gastos')
def mover_ventas():
    return render_template('empresa/mover/ventas-gastos.html')

@app.route('/empresa/mover/flujo')
def mover_flujo():
    return render_template('empresa/mover/flujo-caja.html')

@app.route('/empresa/mover/obligaciones')
def mover_obligaciones():
    return render_template('empresa/mover/obligaciones.html')

@app.route('/empresa/mover/metas')
def mover_metas():
    return render_template('empresa/mover/metas.html')

@app.route('/empresa/mover/inventario')
def mover_inventario():
    return render_template('empresa/mover/inventario.html')

@app.route('/empresa/mover/auditoria')
def mover_auditoria():
    return render_template('empresa/mover/auditoria.html')

@app.route('/empresa/mover/semaforo')
def mover_semaforo():
    return render_template('empresa/mover/semaforo.html')

@app.route('/empresa/mover/progreso')
def mover_progreso():
    return render_template('empresa/mover/progreso.html')

@app.route('/empresa/mover/calendario')
def mover_calendario():
    return render_template('empresa/mover/calendario.html')

@app.route('/empresa/mover/ia-apoyo')
def mover_ia():
    return render_template('empresa/mover/ia-apoyo.html')

@app.route('/empresa/mover/exportar-excel')
def mover_export_excel():
    return render_template('empresa/mover/exportar-excel.html')

# DEMO - Futuro simulado de Mover
@app.route('/empresa/mover/demo')
def mover_demo():
    return render_template('empresa/mover/demo.html')

# ==============================================================================
# RUTAS TIBURÓN (CRM Premium)
# ==============================================================================

@app.route('/empresa/tiburon')
def tiburon():
    return render_template('empresa/tiburon/tiburon.html')

# DEMO - Futuro simulado de Tiburón
@app.route('/empresa/tiburon/demo')
def tiburon_demo():
    return render_template('empresa/tiburon/demo.html')

# ==============================================================================
# RUTAS HAMBRE (Operations Premium)
# ==============================================================================

@app.route('/empresa/hambre')
def hambre():
    return render_template('empresa/hambre/hambre.html')

# DEMO - Futuro simulado de Hambre
@app.route('/empresa/hambre/demo')
def hambre_demo():
    return render_template('empresa/hambre/demo.html')

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
