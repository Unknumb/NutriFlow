FROM node:20-alpine

WORKDIR /app

# Copiar package.json y package-lock.json si existe
COPY package*.json ./
# Copiar el esquema de Prisma
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

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
