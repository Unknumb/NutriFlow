# Etapa 1: Build
FROM node:26-alpine@sha256:725aeba2364a9b16beae49e180d83bd597dbd0b15c47f1f28875c290bfd255b9 AS build

WORKDIR /app

# Usamos ci para asegurar que instalamos exactamente lo que dice tu package-lock.json
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: Production
FROM nginx:stable-alpine@sha256:0d3b80406a13a767339fbe2f41406d6c7da727ab89cf8fae399e81f780f814d1

# Copiamos nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos de Vite (carpeta /dist)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]