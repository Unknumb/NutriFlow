import json
import sys
import os

# Agregamos el directorio actual al path para que Python encuentre 'main'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

def export_openapi():
    schema = app.openapi()
    with open("openapi.json", "w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2, ensure_ascii=False)
    print("✅ Esquema OpenAPI exportado exitosamente a 'openapi.json'")

if __name__ == "__main__":
    export_openapi()
