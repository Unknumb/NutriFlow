FROM python:3.11-slim@sha256:b27df5841f3355e9473f9a516d38a6783b6c8dfeacaf2d14a240f443b368ddb6

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

# Exponer el puerto
EXPOSE 8000

# Iniciar la aplicación FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
