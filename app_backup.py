from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from datetime import timedelta
import os
import json
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

@app.route('/empresa/essential/mi-negocio')
def essential_negocio():
    return render_template('empresa/essential/panel-negocio.html',
                           SUPABASE_URL=SUPABASE_URL, SUPABASE_KEY=SUPABASE_KEY)

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
# API IA — OPENAI INTEGRADO CON CONTEXTO FINANCIERO REAL
# ==============================================================================

PLAN_LIMITS = {
    'essential': { 'daily_messages': 20, 'max_tokens': 500,  'model': 'gpt-4o-mini', 'months_history': 3  },
    'tiburon':   { 'daily_messages': 100,'max_tokens': 1000, 'model': 'gpt-4o',      'months_history': 12 },
    'hambre':    { 'daily_messages': 200,'max_tokens': 2000, 'model': 'gpt-4o',      'months_history': 24 },
}

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """
    Endpoint principal de IA — Lee contexto financiero real y consulta OpenAI.
    Recibe: { message, context, history, plan }
    Devuelve: { response, tokens_used }
    """
    try:
        from openai import OpenAI

        data       = request.get_json(silent=True) or {}
        user_msg   = (data.get('message') or '').strip()
        context    = data.get('context') or {}
        history    = data.get('history') or []
        plan       = data.get('plan', 'essential')

        if not user_msg:
            return jsonify({'error': 'Mensaje vacío'}), 400

        limits = PLAN_LIMITS.get(plan, PLAN_LIMITS['essential'])

        # ── Construir el system prompt con contexto financiero real ──
        ctx_lines = []
        if context.get('ingresos') is not None:
            ctx_lines.append(f"- Ingresos del mes actual: ${int(context['ingresos']):,}".replace(',', '.'))
        if context.get('gastos') is not None:
            ctx_lines.append(f"- Gastos del mes actual: ${int(context['gastos']):,}".replace(',', '.'))
        if context.get('balance') is not None:
            ctx_lines.append(f"- Balance neto: ${int(context['balance']):,}".replace(',', '.'))
        if context.get('margen') is not None:
            ctx_lines.append(f"- Margen de rentabilidad: {context['margen']}%")
        if context.get('transacciones') is not None:
            ctx_lines.append(f"- Transacciones registradas: {context['transacciones']}")

        financial_ctx = "\n".join(ctx_lines) if ctx_lines else "El usuario aún no tiene transacciones registradas este mes."

        system_prompt = f"""Eres Pymax AI, el asesor financiero inteligente de la plataforma Pymax.
Tu misión es ayudar a emprendedores y pequeños empresarios a entender y mejorar sus finanzas.

DATOS FINANCIEROS REALES DEL USUARIO (del mes actual):
{financial_ctx}

INSTRUCCIONES:
- Responde SIEMPRE en español, de forma directa, clara y accionable
- Usa los datos financieros reales del usuario para personalizar cada respuesta
- Sé conciso pero útil. Máximo 3-4 párrafos cortos
- Si el usuario pregunta algo fuera de finanzas, redirige amablemente al tema financiero
- Nunca inventes datos que no estén en el contexto
- Usa un tono profesional pero cercano, como un asesor de confianza
- Plan del usuario: {plan.upper()} (considera las limitaciones del plan al dar recomendaciones)

Recuerda: el usuario confía en ti para tomar decisiones reales de su negocio."""

        # ── Construir historial de mensajes ──
        messages = [{'role': 'system', 'content': system_prompt}]

        for h in history[-6:]:  # últimos 6 mensajes
            if h.get('role') in ('user', 'assistant') and h.get('content'):
                messages.append({'role': h['role'], 'content': str(h['content'])[:500]})

        messages.append({'role': 'user', 'content': user_msg})

        # ── Llamar a OpenAI ──
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

        completion = client.chat.completions.create(
            model=limits['model'],
            messages=messages,
            max_tokens=limits['max_tokens'],
            temperature=0.7,
        )

        ai_response = completion.choices[0].message.content
        tokens_used = completion.usage.total_tokens if completion.usage else 0

        return jsonify({
            'response':    ai_response,
            'tokens_used': tokens_used,
            'model':       limits['model'],
            'plan':        plan
        })

    except Exception as e:
        print(f'[AI ERROR] {e}')
        return jsonify({
            'response': 'En este momento no puedo procesar tu consulta. Por favor intenta nuevamente en unos segundos.',
            'error': str(e)
        }), 200  # 200 para que el frontend lo maneje normalmente

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
