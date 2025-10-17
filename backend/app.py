from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3, os, secrets

app = Flask(__name__)

# === Configurar CORS (permite acceso desde tu frontend local y desde Netlify) ===
CORS(app, resources={r"/*": {"origins": ["*", "http://127.0.0.1:5500", "https://pymaxcenter2.netlify.app"]}})

# === Configuración ===
DB_FILE = "usuarios.db"
SECRET_KEY = os.environ.get("SECRET_KEY", secrets.token_hex(16))
app.config['SECRET_KEY'] = SECRET_KEY

# === Crear base de datos si no existe ===
def crear_bd():
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                confirmed INTEGER DEFAULT 0,
                token TEXT
            )
        ''')
        conn.commit()

crear_bd()

# === Ruta raíz ===
@app.route('/')
def home():
    return jsonify({"message": "Pymax backend activo "})

# === Registro ===
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"error": "Campos incompletos"}), 400

    token = secrets.token_urlsafe(16)
    try:
        with sqlite3.connect(DB_FILE) as conn:
            c = conn.cursor()
            c.execute("INSERT INTO usuarios (name, email, password, token) VALUES (?, ?, ?, ?)",
                      (name, email, password, token))
            conn.commit()
        return jsonify({"message": "Usuario registrado", "token": token})
    except sqlite3.IntegrityError:
        return jsonify({"error": "El correo ya está registrado"}), 409

# === Confirmar correo ===
@app.route('/api/confirm', methods=['GET'])
def confirm():
    token = request.args.get('token')
    if not token:
        return jsonify({"error": "Token no proporcionado"}), 400

    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("SELECT id FROM usuarios WHERE token=?", (token,))
        user = c.fetchone()
        if not user:
            return jsonify({"error": "Token inválido"}), 404

        c.execute("UPDATE usuarios SET confirmed=1 WHERE id=?", (user[0],))
        conn.commit()
        return jsonify({"message": "Cuenta confirmada correctamente"})

# === Iniciar sesión ===
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("SELECT name, confirmed FROM usuarios WHERE email=? AND password=?", (email, password))
        user = c.fetchone()

        if not user:
            return jsonify({"error": "Correo o contraseña incorrectos"}), 401
        if user[1] == 0:
            return jsonify({"error": "Cuenta no confirmada"}), 403

        session_token = secrets.token_urlsafe(16)
        return jsonify({"message": "Inicio de sesión exitoso", "name": user[0], "email": email, "session_token": session_token})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
