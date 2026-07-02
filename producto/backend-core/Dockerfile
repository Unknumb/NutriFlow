FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293

WORKDIR /app

# Copiar package.json y package-lock.json si existe
COPY package*.json ./
# Copiar el esquema de Prisma
COPY prisma ./prisma/

# Instalar dependencias de forma reproducible desde package-lock.json
RUN npm ci

# Generar el cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer el puerto
EXPOSE 3000

# Iniciar la aplicación
CMD ["npm", "run", "start:prod"]
