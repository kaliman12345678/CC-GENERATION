import os, base64
from PIL import Image

logo_files = {
    'cali': 'assets/logos/logo-cali.png',
    'medellin': 'assets/logos/logo-medellin.png',
    'bucaramanga': 'assets/logos/logo-bucaramanga.png',
    'barranquilla': 'assets/logos/logo-barranquilla.png',
    'cartagena': 'assets/logos/logo-cartagena.png',
    'manizales': 'assets/logos/logo-manizales.png',
    'uraba': 'assets/logos/logo-uraba.png',
    'oriente_antioqueno': 'assets/logos/logo-oriente-antioqueno.png'
}

js_lines = ['const OFFICIAL_LOGOS_BASE64 = {']

for key, path in logo_files.items():
    if os.path.exists(path):
        with open(path, 'rb') as f:
            b64 = base64.b64encode(f.read()).decode('utf-8')
        ext = 'jpeg' if path.endswith('.jpg') else 'png'
        js_lines.append(f'  "{key}": "data:image/{ext};base64,{b64}",')
        print(f'Processed {key}: {path}')

js_lines.append('};')

with open('assets/js/official-logos-data.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(js_lines))

print('Updated assets/js/official-logos-data.js successfully')
