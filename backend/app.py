from flask import Flask, redirect, request, jsonify
from flask_cors import CORS
import sqlite3, os, secrets

app = Flask(__name__)

# === CORS configurado para producción y desarrollo ===
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://pymaxcenter2.netlify.app",  # Producción (Netlify)
            "http://127.0.0.1:5500",             # Pruebas locales
            "http://localhost:5500"              # Pruebas locales alternativas
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})


# === Ruta raíz para confirmar que el backend está activo ===
@app.route('/')
def home():
    return jsonify({"message": "Pymax backend activo 🚀"})

# === Ruta: registro de usuario ===
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({"error": "Faltan datos"}), 400

    token = secrets.token_urlsafe(16)

    conn = sqlite3.connect('usuarios.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            confirmed INTEGER DEFAULT 0,
            token TEXT
        )
    ''')
    try:
        cursor.execute('INSERT INTO usuarios (name, email, password, token) VALUES (?, ?, ?, ?)', 
                       (name, email, password, token))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "El correo ya está registrado"}), 400

    conn.close()
    return jsonify({"message": "Usuario registrado correctamente", "token": token}), 200


from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import sqlite3, os, secrets

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import sqlite3, secrets

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/api/confirm', methods=['GET'])
def confirm_email():
    token = request.args.get('token')
    if not token:
        return jsonify({"error": "Token no encontrado"}), 400

    conn = sqlite3.connect('usuarios.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM usuarios WHERE token = ?', (token,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "Token inválido"}), 404

    cursor.execute('UPDATE usuarios SET confirmed = 1 WHERE token = ?', (token,))
    conn.commit()
    conn.close()

    # ✅ Redirección HTML (funciona en Render y móviles)
    return """
    <html>
      <head>
        <meta http-equiv="refresh" content="0; url=https://pymaxcenter2.netlify.app">
        <script>
          window.location.href = "https://pymaxcenter2.netlify.app";
        </script>
      </head>
      <body>
        <p>Redirigiendo a Pymax...</p>
      </body>
    </html>
    """

# === Ruta: login ===
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = sqlite3.connect('usuarios.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM usuarios WHERE email = ? AND password = ?', (email, password))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "Credenciales inválidas"}), 401

    if user[4] == 0:  # Confirmed = 0
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
