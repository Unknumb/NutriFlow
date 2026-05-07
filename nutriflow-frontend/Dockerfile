# Dockerfile exclusivo para DESARROLLO LOCAL
FROM node:20-alpine

WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de Vite
EXPOSE 5173

# Levantamos el servidor de Vite con Hot-Reload activado
CMD ["npm", "run", "dev", "--", "--host"]