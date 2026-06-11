# Etapa 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Usamos ci para asegurar que instalamos exactamente lo que dice tu package-lock.json
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: Production
FROM nginx:stable-alpine

# Copiamos nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos de Vite (carpeta /dist)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]