import requests
from PIL import Image
from io import BytesIO
import os

def download_and_save_logo():
    # URL del logo
    logo_url = 'https://i.postimg.cc/VvYSdx0b/logo-instituto-pro.jpg'
    
    try:
        # Descargar la imagen
        response = requests.get(logo_url)
        response.raise_for_status()
        
        # Abrir la imagen con Pillow
        img = Image.open(BytesIO(response.content))
        
        # Convertir a PNG y guardar
        output_path = os.path.join('static', 'img', 'logo.png')
        img.save(output_path, 'PNG')
        
        print(f'Logo descargado y guardado exitosamente en {output_path}')
        return True
    except Exception as e:
        print(f'Error al descargar el logo: {str(e)}')
        return False

if __name__ == '__main__':
    download_and_save_logo() 