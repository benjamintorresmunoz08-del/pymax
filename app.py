from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3, secrets, os, time

app = Flask(__name__)

# =========================
# BASE DE DATOS (RUTA ABSOLUTA)
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "pymax_usuarios_v3.db")


# =========================
# CORS (PERMITIR TODO MIENTRAS DESARROLLAS)
# =========================
CORS(
    app,
    resources={r"/*": {"origins": "*"}}
)


# =========================
# FUNCIONES DE BASE DE DATOS
# =========================

def connect_db(retries=5, delay=0.2):
    """
    Intenta conectarse a la BD varias veces.
    Útil cuando Render "despierta" y SQLite todavía no está listo.
    """
    last_err = None
    for _ in range(retries):
        try:
            conn = sqlite3.connect(DB_PATH)
            return conn
        except sqlite3.OperationalError as e:
            last_err = e
            time.sleep(delay)
    print("NO SE PUDO CONECTAR A LA BD:", last_err)
    return None


def ensure_users_table(conn):
    """
    - Crea la tabla usuarios si no existe.
    - Si faltan columnas (confirmed, token) las agrega.
    """
    if conn is None:
        return

    cur = conn.cursor()

    # Crear tabla base
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

    # Revisar columnas
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
        print("BD inicializada en:", DB_PATH)
    else:
        print("NO se pudo inicializar la BD al arrancar")


# Ejecutar al importar la app (Render + local)
init_db()


# =========================
# RUTAS
# =========================

@app.route("/")
def home():
    # mensaje distinto para saber que esta versión está corriendo
    return jsonify({"message": "Pymax backend v3 activo 🚀"})


# ---------- REGISTRO ----------
@app.route("/api/register", methods=["POST"])
def register():
    try:
        data = request.get_json(silent=True) or {}
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not all([name, email, password]):
            return jsonify({"error": "Faltan datos"}), 400

        conn = connect_db()
        if conn is None:
            return jsonify({"error": "Servidor iniciando, intenta nuevamente."}), 503

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
        return jsonify({"message": "Usuario registrado correctamente", "token": token}), 200

    except Exception as e:
        print("ERROR EN /api/register:", e)
        return jsonify({"error": "Error interno en el servidor"}), 500


# ---------- CONFIRMACIÓN ----------
@app.route("/api/confirm", methods=["GET"])
def confirm_email():
    try:
        token = request.args.get("token")
        if not token:
            return jsonify({"error": "Token no encontrado"}), 400

        conn = connect_db()
        if conn is None:
            return jsonify({"error": "Servidor iniciando, intenta nuevamente."}), 503

        ensure_users_table(conn)
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM usuarios WHERE token = ?", (token,))
        user = cursor.fetchone()
        if not user:
            conn.close()
            return jsonify({"error": "Token inválido"}), 404

        cursor.execute("UPDATE usuarios SET confirmed = 1 WHERE token = ?", (token,))
        conn.commit()
        conn.close()

        # Redirección a Netlify
        return """
        <html>
          <head>
            <meta http-equiv="refresh" content="0; url=https://pymaxcenter2.netlify.app?confirm=ok">
            <script>window.location.href="https://pymaxcenter2.netlify.app?confirm=ok";</script>
          </head>
          <body>Redirigiendo a Pymax...</body>
        </html>
        """

    except Exception as e:
        print("ERROR EN /api/confirm:", e)
        return jsonify({"error": "Error interno en el servidor"}), 500


# ---------- LOGIN ----------
@app.route("/api/login", methods=["POST"])
def login():
    try:
        # 1) Leer datos
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip()
        password = (data.get("password") or "").strip()

        if not email or not password:
            return jsonify({"error": "Faltan datos"}), 400

        # 2) Conectar a BD
        conn = connect_db()
        if conn is None:
            return jsonify({"error": "Servidor iniciando, intenta nuevamente."}), 503

        try:
            ensure_users_table(conn)
            cur = conn.cursor()

            cur.execute("""
                SELECT
                    id,
                    name,
                    email,
                    password,
                    COALESCE(confirmed, 0) AS confirmed
                FROM usuarios
                WHERE email = ?
            """, (email,))
            row = cur.fetchone()
        except sqlite3.Error as db_err:
            print("ERROR BD EN /api/login:", db_err)
            conn.close()
            return jsonify({
                "error": "Problema con la base de datos. Intenta nuevamente en unos minutos."
            }), 503
        finally:
            try:
                conn.close()
            except:
                pass

        # 3) Validaciones de negocio (NO generan 500)
        if not row:
            return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

        user_id, name, email_db, password_db, confirmed = row

        if password_db != password:
            return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

        if not confirmed:
            return jsonify({"error": "Tu correo aún no está confirmado."}), 403

        # 4) Generar token de sesión
        session_token = secrets.token_urlsafe(16)

        return jsonify({
            "message": "Inicio de sesión exitoso",
            "name": name,
            "email": email_db,
            "session_token": session_token
        }), 200

    except Exception as e:
        print("ERROR DESCONOCIDO EN /api/login:", e)
        return jsonify({
            "error": "Error interno al iniciar sesión. Intenta nuevamente."
        }), 500


if __name__ == "__main__":
    # Solo local; en Render se usa gunicorn (Start Command)
    app.run(host="0.0.0.0", port=5000)
