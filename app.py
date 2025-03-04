from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import pandas as pd
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'tu_clave_secreta_aqui'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///instituto.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['LOGO_FOLDER'] = os.path.join('static', 'img')
app.config['LOGO_NAME'] = 'logo.svg'

db = SQLAlchemy(app)

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

@app.route('/api/upload-alumnos', methods=['POST'])
def upload_alumnos():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No se envió ningún archivo'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No se seleccionó ningún archivo'})
    
    if not file.filename.endswith('.xlsx'):
        return jsonify({'success': False, 'message': 'El archivo debe ser un Excel (.xlsx)'})
    
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        
        df = pd.read_excel(filepath)
        
        for _, row in df.iterrows():
            alumno = Alumno(
                nombre=row['nombre'],
                dni=row['dni'],
                fecha_nacimiento=datetime.strptime(str(row['fecha_nacimiento']), '%Y-%m-%d').date(),
                curso=row['curso'],
                fecha_inscripcion=datetime.now().date(),
                responsable=row['responsable'],
                telefono=row['telefono'],
                direccion=row['direccion'],
                tipo_promocion=row.get('tipo_promocion', None),
                descuento=row.get('descuento', 0)
            )
            db.session.add(alumno)
        
        db.session.commit()
        os.remove(filepath)
        
        return jsonify({'success': True, 'message': 'Alumnos importados correctamente'})
    
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'success': False, 'message': f'Error al procesar el archivo: {str(e)}'})

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