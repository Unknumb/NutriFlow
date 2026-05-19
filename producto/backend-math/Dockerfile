FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema requeridas (gcc)
RUN apt-get update && \
    apt-get install -y gcc && \
    rm -rf /var/lib/apt/lists/*

# Instalar el gestor de paquetes uv
RUN pip install uv

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
