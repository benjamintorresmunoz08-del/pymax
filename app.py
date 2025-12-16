# =========================
# IMPORTS
# =========================
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import sqlite3
import secrets
import os
import time
import io
from datetime import datetime, timedelta
from openpyxl import Workbook
from supabase import create_client

# =========================
# APP
# =========================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# =========================
# SQLITE (USUARIOS LOCALES)
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "pymax_usuarios_v3.db")

def connect_db(retries=5, delay=0.2):
    last_err = None
    for _ in range(retries):
        try:
            return sqlite3.connect(DB_PATH)
        except sqlite3.OperationalError as e:
            last_err = e
            time.sleep(delay)
    print("NO SE PUDO CONECTAR A LA BD:", last_err)
    return None

def ensure_users_table(conn):
    if conn is None:
        return

    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            confirmed INTEGER DEFAULT 0,
            token TEXT
        )
    """)

    cur.execute("PRAGMA table_info(usuarios)")
    cols = [row[1] for row in cur.fetchall()]

    if "confirmed" not in cols:
        cur.execute("ALTER TABLE usuarios ADD COLUMN confirmed INTEGER DEFAULT 0")
    if "token" not in cols:
        cur.execute("ALTER TABLE usuarios ADD COLUMN token TEXT")

    conn.commit()

def init_db():
    conn = connect_db()
    if conn:
        ensure_users_table(conn)
        conn.close()
        print("BD inicializada:", DB_PATH)

init_db()

# =========================
# SUPABASE
# =========================
SUPABASE_URL = "https://haqjuyagyvxynmulanhe.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# =========================
# RUTA BASE
# =========================
@app.route("/")
def home():
    return jsonify({"message": "Pymax backend v3 activo 🚀"})

# =========================
# AUTH
# =========================
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"error": "Faltan datos"}), 400

    conn = connect_db()
    ensure_users_table(conn)
    cursor = conn.cursor()

    token = secrets.token_urlsafe(16)

    try:
        cursor.execute(
            "INSERT INTO usuarios (name, email, password, token) VALUES (?, ?, ?, ?)",
            (name, email, password, token)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "El correo ya está registrado"}), 400

    conn.close()
    return jsonify({"message": "Usuario registrado", "token": token})

@app.route("/api/confirm", methods=["GET"])
def confirm_email():
    token = request.args.get("token")
    conn = connect_db()
    ensure_users_table(conn)
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM usuarios WHERE token = ?", (token,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "Token inválido"}), 404

    cursor.execute("UPDATE usuarios SET confirmed = 1 WHERE token = ?", (token,))
    conn.commit()
    conn.close()

    return """
    <script>
      window.location.href="https://pymaxcenter2.netlify.app?confirm=ok";
    </script>
    """

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    conn = connect_db()
    ensure_users_table(conn)
    cur = conn.cursor()

    cur.execute("SELECT id, name, password, confirmed FROM usuarios WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()

    if not row or row[2] != password:
        return jsonify({"error": "Credenciales incorrectas"}), 401

    if not row[3]:
        return jsonify({"error": "Correo no confirmado"}), 403

    return jsonify({
        "message": "Login exitoso",
        "user_id": row[0],
        "name": row[1]
    })

# =========================
# SUSCRIPCIÓN
# =========================
@app.route("/activar-mover-fichas", methods=["POST"])
def activar_mover_fichas():
    user_id = request.json.get("user_id")
    hoy = datetime.utcnow()
    vencimiento = hoy + timedelta(days=30)

    supabase.table("suscripciones").insert({
        "user_id": user_id,
        "plan": "mover_fichas",
        "estado": "activo",
        "fecha_inicio": hoy.isoformat(),
        "fecha_vencimiento": vencimiento.isoformat()
    }).execute()

    return jsonify({"ok": True})

# =========================
# MOVIMIENTOS
# =========================
@app.route("/movimientos", methods=["POST"])
def crear_movimiento():
    supabase.table("movimientos").insert(request.json).execute()
    return jsonify({"ok": True})

# =========================
# OBLIGACIONES
# =========================
@app.route("/obligaciones", methods=["POST"])
def crear_obligacion():
    supabase.table("obligaciones").insert(request.json).execute()
    return jsonify({"ok": True})

@app.route("/obligaciones", methods=["GET"])
def listar_obligaciones():
    user_id = request.args.get("user_id")
    res = supabase.table("obligaciones").select("*").eq("user_id", user_id).execute()
    return jsonify(res.data)

# =========================
# CALENDARIO
# =========================
@app.route("/calendario", methods=["POST"])
def crear_evento():
    supabase.table("calendario").insert(request.json).execute()
    return jsonify({"ok": True})

@app.route("/calendario", methods=["GET"])
def listar_eventos():
    user_id = request.args.get("user_id")
    res = supabase.table("calendario").select("*").eq("user_id", user_id).execute()
    return jsonify(res.data)

# =========================================================
# === PYMAX CORE · ESTADO FINANCIERO CENTRAL (NUEVO) ===
# =========================================================
@app.route("/progreso", methods=["GET"])
def progreso():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Usuario requerido"}), 400

    hoy = datetime.utcnow()
    inicio_mes = hoy.replace(day=1).date()

    movimientos = supabase.table("movimientos") \
        .select("tipo, monto, fecha") \
        .eq("user_id", user_id) \
        .gte("fecha", inicio_mes.isoformat()) \
        .execute().data

    obligaciones = supabase.table("obligaciones") \
        .select("monto, fecha_pago, estado") \
        .eq("user_id", user_id) \
        .execute().data

    ingresos = sum(m["monto"] for m in movimientos if m["tipo"] == "ingreso")
    gastos = sum(m["monto"] for m in movimientos if m["tipo"] == "gasto")
    flujo = ingresos - gastos

    obligaciones_vencidas = [
        o for o in obligaciones
        if o["estado"] == "pendiente" and datetime.fromisoformat(o["fecha_pago"]) < hoy
    ]

    # SEMÁFORO
    if flujo > 0 and not obligaciones_vencidas:
        semaforo = "VERDE"
    elif flujo == 0 or obligaciones_vencidas:
        semaforo = "AMARILLO"
    else:
        semaforo = "ROJO"

    # ORDEN FINANCIERO (0-100)
    orden = 0
    if movimientos:
        orden += 40
    if flujo > 0:
        orden += 25
    if not obligaciones_vencidas:
        orden += 20
    if len(movimientos) >= 5:
        orden += 15

    alertas = []
    if flujo < 0:
        alertas.append("El flujo de caja es negativo este mes.")
    if obligaciones_vencidas:
        alertas.append("Existen obligaciones vencidas.")
    if not movimientos:
        alertas.append("No hay registros financieros este mes.")

    return jsonify({
        "ingresos_mes": ingresos,
        "gastos_mes": gastos,
        "resultado_mes": ingresos - gastos,
        "flujo_actual": flujo,
        "semaforo": semaforo,
        "orden_financiero": orden,
        "alertas": alertas
    })

# =========================
# EXCEL
# =========================
@app.route("/exportar-excel", methods=["GET"])
def exportar_excel():
    user_id = request.args.get("user_id")
    inicio_mes = datetime.utcnow().replace(day=1).date()

    movimientos = supabase.table("movimientos") \
        .select("*") \
        .eq("user_id", user_id) \
        .gte("fecha", inicio_mes.isoformat()) \
        .order("fecha") \
        .execute().data

    wb = Workbook()
    ws = wb.active
    ws.append(["Fecha", "Tipo", "Categoría", "Monto"])

    for m in movimientos:
        ws.append([m["fecha"], m["tipo"], m["categoria"], m["monto"]])

    file = io.BytesIO()
    wb.save(file)
    file.seek(0)

    return send_file(
        file,
        as_attachment=True,
        download_name="pymax_mover_fichas.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
