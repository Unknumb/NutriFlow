FROM node:26-alpine@sha256:725aeba2364a9b16beae49e180d83bd597dbd0b15c47f1f28875c290bfd255b9

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

# Ejecutar como usuario no root (node:node, ya presente en la imagen base)
RUN chown -R node:node /app
USER node

# Exponer el puerto
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Iniciar la aplicación
CMD ["npm", "run", "start:prod"]
