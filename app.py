from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import sqlite3, secrets

app = Flask(__name__)

# CORS para Netlify y pruebas locales
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://pymaxcenter2.netlify.app",
            "http://127.0.0.1:5500",
            "http://localhost:5500"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Preflight automático
@app.after_request
def after_request(resp):
    resp.headers.add("Access-Control-Allow-Origin", "*")
    resp.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    resp.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return resp

# Root
@app.route("/")
def home():
    return jsonify({"message": "Pymax backend activo 🚀"})

# Registro
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"error": "Faltan datos"}), 400

    token = secrets.token_urlsafe(16)

    conn = sqlite3.connect("usuarios.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            confirmed INTEGER DEFAULT 0,
            token TEXT
        )
    """)
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

# Confirmación
@app.route("/api/confirm", methods=["GET"])
def confirm_email():
    token = request.args.get("token")
    if not token:
        return jsonify({"error": "Token no encontrado"}), 400

    conn = sqlite3.connect("usuarios.db")
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

# Login
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    conn = sqlite3.connect("usuarios.db")
    cur = conn.cursor()
    cur.execute("SELECT * FROM usuarios WHERE email = ? AND password = ?", (email, password))
    user = cur.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "Credenciales inválidas"}), 401

    if user[4] == 0:  # confirmed == 0
        conn.close()
        return jsonify({"error": "Cuenta no confirmada"}), 403

    session_token = secrets.token_urlsafe(16)
    conn.close()

    return jsonify({
        "message": "Inicio de sesión exitoso",
        "name": user[1],
        "email": user[2],
        "session_token": session_token
    }), 200

if __name__ == "__main__":
    # Solo local; en Render se usa gunicorn (Start Command)
    app.run(host="0.0.0.0", port=5000)
