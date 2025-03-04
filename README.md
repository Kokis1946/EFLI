# Sistema de Gestión Educativa

Este es un sistema integral para la gestión de institutos educativos que permite administrar alumnos, docentes, pagos y usuarios del sistema.

## Características

- Gestión de alumnos
- Gestión de docentes
- Sistema de pagos
- Administración de usuarios
- Importación de datos desde Excel
- Generación de recibos de pago
- Dashboard con estadísticas
- Sistema de roles y permisos

## Requisitos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)
- Navegador web moderno

## Instalación

1. Clonar o descargar este repositorio

2. Crear un entorno virtual:
```bash
python -m venv venv
```

3. Activar el entorno virtual:
- En Windows:
```bash
venv\Scripts\activate
```
- En Linux/Mac:
```bash
source venv/bin/activate
```

4. Instalar las dependencias:
```bash
pip install -r requirements.txt
```

5. Iniciar la aplicación:
```bash
python app.py
```

6. Abrir el navegador y acceder a:
```
http://localhost:5000
```

## Configuración

1. Agregar el logo del instituto:
- Colocar el archivo del logo en la carpeta `static/img/`
- El archivo debe llamarse `logo.png`

2. Configurar la base de datos:
- Por defecto usa SQLite
- Para cambiar a otra base de datos, modificar la variable `SQLALCHEMY_DATABASE_URI` en `app.py`

## Importación de Alumnos desde Excel

El archivo Excel debe tener las siguientes columnas:
- nombre
- dni
- fecha_nacimiento (formato: YYYY-MM-DD)
- curso
- responsable
- telefono
- direccion
- tipo_promocion (opcional)
- descuento (opcional)

## Usuarios por Defecto

Al iniciar por primera vez, se crea un usuario administrador:
- Usuario: admin
- Contraseña: admin123

Se recomienda cambiar la contraseña después del primer inicio de sesión.

## Soporte

Para reportar problemas o sugerir mejoras, por favor crear un issue en el repositorio.

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles. 