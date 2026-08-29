from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from datetime import timedelta, date
import os
import json
import smtplib
import urllib.request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from pathlib import Path
from openai import OpenAI

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

# CONFIGURACIÓN DEEPSEEK (IA de Pymax)
DEEPSEEK_API_KEY = (os.getenv('DEEPSEEK_API_KEY') or '').strip()
DEEPSEEK_BASE_URL = (os.getenv('DEEPSEEK_BASE_URL') or 'https://api.deepseek.com').strip()

# CONFIGURACIÓN EMAIL (recordatorios de deudas)
SMTP_HOST = (os.getenv('SMTP_HOST') or '').strip()
SMTP_PORT = int(os.getenv('SMTP_PORT') or '587')
SMTP_USER = (os.getenv('SMTP_USER') or '').strip()
SMTP_PASS = (os.getenv('SMTP_PASS') or '').strip()
EMAIL_FROM = (os.getenv('EMAIL_FROM') or SMTP_USER or 'Pymax <no-reply@pymax.app>').strip()

# SERVICE ROLE KEY (bypass RLS para recordatorios globales de deudas)
SERVICE_ROLE_KEY = (os.getenv('SERVICE_ROLE_KEY') or os.getenv('SUPABASE_SERVICE_KEY') or '').strip()

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
# RUTA DE LOGOUT (cierra sesión server-side de Flask)
# ==============================================================================

@app.route('/logout')
def logout_route():
    session.clear()
    return redirect(url_for('index'))


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
# API IA — DEEPSEEK INTEGRADO CON CONTEXTO FINANCIERO REAL
# ==============================================================================

PLAN_LIMITS = {
    'essential': { 'daily_messages': 20, 'max_tokens': 500,  'model': 'deepseek-chat', 'months_history': 3  },
    'tiburon':   { 'daily_messages': 100,'max_tokens': 1000, 'model': 'deepseek-chat',      'months_history': 12 },
    'hambre':    { 'daily_messages': 200,'max_tokens': 2000, 'model': 'deepseek-chat',      'months_history': 24 },
}

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """
    Endpoint principal de IA — Lee contexto financiero real y consulta DeepSeek.
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

        # ── Llamar a DeepSeek (API compatible con OpenAI) ──
        if DEEPSEEK_API_KEY:
            client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)
        else:
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
# RECORDATORIOS DE DEUDAS POR EMAIL
# (2 días antes, 1 día antes y el mismo día del vencimiento)
# ==============================================================================

def _supa_rest_get(path, key):
    req = urllib.request.Request(
        SUPABASE_URL.rstrip('/') + '/rest/v1/' + path,
        headers={'apikey': key, 'Authorization': 'Bearer ' + key}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode('utf-8'))


def _supa_rest_post(path, key, payload):
    body = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        SUPABASE_URL.rstrip('/') + '/rest/v1/' + path,
        data=body, method='POST',
        headers={'apikey': key, 'Authorization': 'Bearer ' + key,
                 'Content-Type': 'application/json', 'Prefer': 'return=minimal'}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.status


def _send_email(to, subject, html):
    if not SMTP_HOST:
        print('[EMAIL] SMTP_HOST no configurado. No se envió el correo.')
        return False
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = EMAIL_FROM
    msg['To'] = to
    msg.attach(MIMEText(html, 'html', 'utf-8'))
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as s:
            s.ehlo()
            if SMTP_PORT in (587, 465):
                s.starttls()
                s.ehlo()
            if SMTP_USER:
                s.login(SMTP_USER, SMTP_PASS)
            s.sendmail(EMAIL_FROM, [to], msg.as_string())
        return True
    except Exception as e:
        print(f'[EMAIL] Error enviando a {to}: {e}')
        return False


@app.route('/api/debt-reminders/check')
def debt_reminders_check():
    """Envía recordatorios de deudas que vencen hoy, mañana o en 2 días."""
    if not SERVICE_ROLE_KEY:
        return jsonify({'ok': False, 'reason': 'SERVICE_ROLE_KEY no configurada'}), 400

    today = date.today()
    dias = [today, today + timedelta(days=1), today + timedelta(days=2)]
    dstr = ','.join(d.isoformat() for d in dias)

    try:
        rows = _supa_rest_get(
            'obligaciones?select=id,tipo,monto,fecha_pago,email_contacto'
            f'&estado=neq.pagada&estado=neq.pagado&email_contacto=not.is.null&fecha_pago=in.({dstr})',
            SERVICE_ROLE_KEY
        )
    except Exception as e:
        print(f'[REMINDER] Error consultando obligaciones: {e}')
        return jsonify({'ok': False, 'reason': str(e)}), 500

    enviados = 0
    omitidos = 0
    for ob in rows:
        email = (ob.get('email_contacto') or '').strip()
        due = ob.get('fecha_pago')
        oid = ob.get('id')
        if not email or not due or oid is None:
            continue
        try:
            due_d = date.fromisoformat(due)
        except Exception:
            continue
        delta = (due_d - today).days
        if delta not in (0, 1, 2):
            continue

        # Evitar duplicados (tabla opcional debt_reminders)
        try:
            ya = _supa_rest_get(
                f'debt_reminders?select=id&obligation_id=eq.{oid}&days_before=eq.{delta}&limit=1',
                SERVICE_ROLE_KEY
            )
            if ya:
                omitidos += 1
                continue
        except Exception:
            pass

        tipo = ob.get('tipo') or ''
        resto = tipo.split(' | ', 1)[-1]
        concepto = resto.split(' [', 1)[0].split(' ::', 1)[0].split(' ##', 1)[0].strip() or 'Tu obligación'
        monto = int(float(ob.get('monto') or 0))

        if delta == 0:
            subject = '🔔 Tu pago vence HOY'
            headline = 'vence hoy'
        elif delta == 1:
            subject = '⏰ Tu pago vence mañana'
            headline = 'vence mañana'
        else:
            subject = '📅 Tu pago vence en 2 días'
            headline = 'vence en 2 días'

        monto_txt = f'{monto:,}'.replace(',', '.')
        html = f'''<div style="font-family:Inter,Arial,sans-serif;background:#060A14;color:#E2E8F0;padding:32px;border-radius:16px;max-width:520px">
          <h2 style="color:#F1F5FF;margin:0 0 8px">Hola 👋</h2>
          <p style="margin:0 0 16px;color:#94A3B8;font-size:15px">Tienes una obligación que <strong style="color:#FCD34D">{headline}</strong>.</p>
          <div style="background:#0B1020;border:1px solid #1E293B;border-radius:12px;padding:16px;margin:0 0 20px">
            <p style="margin:0 0 6px;font-size:14px;color:#F1F5FF"><strong>{concepto}</strong></p>
            <p style="margin:0;font-size:22px;font-weight:800;color:#34D399">${monto_txt} CLP</p>
          </div>
          <p style="margin:0;color:#64748B;font-size:12px">Programa tu pago a tiempo para evitar recargos. — Pymax</p>
        </div>'''

        if _send_email(email, subject, html):
            enviados += 1
            try:
                _supa_rest_post('debt_reminders', SERVICE_ROLE_KEY, {
                    'obligation_id': oid, 'due_date': due, 'days_before': delta
                })
            except Exception as e:
                print(f'[REMINDER] No se pudo registrar envío: {e}')

    return jsonify({'ok': True, 'sent': enviados, 'skipped': omitidos})


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
