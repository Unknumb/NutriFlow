FROM node:25-alpine@sha256:bdf2cca6fe3dabd014ea60163eca3f0f7015fbd5c7ee1b0e9ccb4ced6eb02ef4

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
