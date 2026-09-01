FROM python:3.14-slim@sha256:b877e50bd90de10af8d82c57a022fc2e0dc731c5320d762a27986facfc3355c1

WORKDIR /app

# Instalar dependencias del sistema requeridas (gcc)
RUN apt-get update && \
    apt-get install -y gcc && \
    rm -rf /var/lib/apt/lists/*

# Instalar el gestor de paquetes uv (versión fijada para builds reproducibles)
RUN pip install uv==0.11.26

# Copiar archivo de requerimientos
COPY requirements.txt .

# Instalar dependencias de Python usando uv
RUN uv pip install --system -r requirements.txt

# Copiar el resto del código
COPY . .

# Ejecutar como usuario no root
RUN useradd --create-home --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

# Exponer el puerto
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# Iniciar la aplicación FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
