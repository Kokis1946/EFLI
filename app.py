from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///instituto.db')
if app.config['SQLALCHEMY_DATABASE_URI'].startswith("postgres://"):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['LOGO_FOLDER'] = os.path.join('static', 'img')
app.config['LOGO_NAME'] = 'logo.svg'

# Crear carpeta de uploads si no existe
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)

# Ruta de prueba para verificar la conexión a la base de datos
@app.route('/db-test')
def db_test():
    try:
        db.session.execute('SELECT 1')
        return jsonify({'status': 'success', 'message': 'Conexión a la base de datos exitosa'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

# Modelos
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    usuario = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    rol = db.Column(db.String(20), nullable=False)
    activo = db.Column(db.Boolean, default=True)

class Alumno(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    dni = db.Column(db.String(20), unique=True, nullable=False)
    fecha_nacimiento = db.Column(db.Date, nullable=False)
    curso = db.Column(db.String(50), nullable=False)
    fecha_inscripcion = db.Column(db.Date, nullable=False)
    responsable = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(20), nullable=False)
    direccion = db.Column(db.String(200), nullable=False)
    tipo_promocion = db.Column(db.String(50))
    descuento = db.Column(db.Integer, default=0)

class Pago(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    alumno_id = db.Column(db.Integer, db.ForeignKey('alumno.id'), nullable=False)
    concepto = db.Column(db.String(50), nullable=False)
    monto = db.Column(db.Float, nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    metodo_pago = db.Column(db.String(50), nullable=False)
    estado = db.Column(db.String(20), default='pagado')
    notas = db.Column(db.Text)

# Rutas
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    usuario = Usuario.query.filter_by(usuario=data['username']).first()
    if usuario and check_password_hash(usuario.password_hash, data['password']):
        return jsonify({
            'success': True,
            'user': {
                'nombre': usuario.nombre,
                'rol': usuario.rol
            }
        })
    return jsonify({'success': False, 'message': 'Usuario o contraseña incorrectos'})

@app.route('/static/img/<path:filename>')
def serve_logo(filename):
    return send_file(os.path.join(app.config['LOGO_FOLDER'], filename))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        os.makedirs(app.config['LOGO_FOLDER'], exist_ok=True)
        
        # Crear usuario administrador por defecto
        admin = Usuario.query.filter_by(usuario='admin').first()
        if not admin:
            admin = Usuario(
                nombre='Administrador',
                usuario='admin',
                email='admin@instituto.com',
                password_hash=generate_password_hash('admin123'),
                rol='admin',
                activo=True
            )
            db.session.add(admin)
            db.session.commit()
        
    app.run(debug=True) 