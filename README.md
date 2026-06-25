# 🍏 NutriFlow

Plataforma SaaS Cloud para la Gestión Integral de Consultas Nutricionales.

## 📖 Sobre el Proyecto

NutriFlow es una aplicación web diseñada a medida para optimizar el flujo de trabajo clínico nutricional. El objetivo principal es automatizar los cálculos metabólicos, digitalizar la distribución visual de porciones y generar sugerencias automáticas de preparaciones, eliminando la dependencia de múltiples planillas de cálculo estáticas.

### ✨ Características Principales y Avances

Durante el desarrollo del proyecto, hemos consolidado la arquitectura y completado múltiples hitos importantes:

- **Estabilización de Arquitectura:** Migración completa y puesta en marcha de todos los servicios (frontend, backend-core y backend-math) de manera orquestada.
- **Integración del Dashboard Clínico:** Interfaz centralizada para la gestión de pacientes y consultas.
- **Calculadora Inteligente de TMB (Backend Math):** Módulo matemático en FastAPI completamente funcional que promedia múltiples fórmulas clínicas (Harris-Benedict, Mifflin, etc.) para el cálculo de la Tasa Metabólica Basal.
- **Orquestación de Microservicios:** Comunicación fluida y endpoints integrados entre el backend principal en NestJS y el motor matemático en Python.
- **Gestión de Base de Datos:** Implementación de Prisma ORM en NestJS y SQLAlchemy en FastAPI con PostgreSQL, incluyendo endpoints funcionales para la consulta de datos alimentarios.
- **Cuadrador Dinámico de Macronutrientes:** Ajuste en tiempo real basado en pesos de referencia, con resultados cacheados en Redis (TTL 24h) para mejorar la reactividad.
- **Pizarra Visual Interactiva & Armador de Pautas:** Sistema _Drag & Drop_ para distribuir porciones por tiempos de comida.
- **Flujo de Planificaciones:** Generación y persistencia de pautas y planificaciones nutricionales, con generador de menús y biblioteca de preparaciones.
- **Indicador de Estado de Conexión:** Chequeo en vivo de la disponibilidad del backend desde el frontend.
- **Pruebas Automatizadas:** Suite de tests unitarios en backend-core (Jest) y backend-math (pytest), más documentación de pruebas funcionales y casos de prueba.
- **Despliegue en la Nube:** Frontend desplegado en Vercel (con _rewrites_ SPA) y backends con CORS configurable por entorno.

## 🛠️ Stack Tecnológico Actualizado

La arquitectura del proyecto está basada en un modelo de microservicios contenerizado para asegurar alta disponibilidad y escalabilidad, utilizando las siguientes tecnologías:

### 🎨 Frontend (`nutriflow-frontend`)

- **Framework:** React 19 con Vite.
- **Estilos:** TailwindCSS v4.
- **Estado y Fetching:** Zustand, React Query (`@tanstack/react-query`).
- **Enrutamiento:** TanStack Router (`@tanstack/react-router`).
- **Drag & Drop:** `@dnd-kit` (pizarra visual y armador de pautas).
- **Generación de PDF:** `@react-pdf/renderer`.
- **Gráficos:** `recharts`.
- **Autenticación y Servicios:** Supabase (`@supabase/supabase-js`).

### ⚙️ Backend Core (`backend-core`)

- **Framework:** TypeScript con NestJS 11.
- **ORM:** Prisma ORM (`@prisma/client`, `@prisma/adapter-pg`).
- **Base de Datos:** PostgreSQL (Supabase).
- **Caché:** Redis (Upstash) vía cliente REST.
- **Autenticación:** Passport + JWT validando tokens emitidos por Supabase.
- **Documentación:** Swagger / OpenAPI (`@nestjs/swagger`).
- **Testing:** Jest (unitarios + e2e).

### 🧮 Backend Math (`backend-math`)

- **Framework:** Python con FastAPI.
- **ORM:** SQLAlchemy (con `psycopg2`).
- **Base de Datos:** PostgreSQL.
- **Servidor ASGI:** Uvicorn.
- **Validación de Datos:** Pydantic.
- **Testing:** pytest.

### 🐳 Infraestructura y Herramientas Adicionales

- **Contenedores:** Docker & Docker Compose.
- **Caché en Memoria:** Redis / Upstash (para optimizar la reactividad de la interfaz).
- **Despliegue:** Vercel (frontend).
- **CI:** GitHub Actions — respaldo diario (`pg_dump`) de la base de datos de producción.
- **Versionamiento:** Git / GitHub.

## 🗂️ Estructura del Repositorio

```
producto/
├── nutriflow-frontend/   # SPA React 19 + Vite (puerto 5173)
├── backend-core/         # API NestJS 11 — orquestador, Prisma, auth (puerto 3000)
├── backend-math/         # Microservicio FastAPI de cálculos (puerto 8000)
└── docker-compose.yml    # Orquesta backend-core, backend-math y redis-cache
```

El **frontend** se comunica únicamente con `backend-core`, que actúa como orquestador: gestiona PostgreSQL vía Prisma, valida la autenticación y delega los cálculos pesados a `backend-math` por HTTP.

| Servicio        | Puerto | Descripción                                  |
| --------------- | ------ | -------------------------------------------- |
| nutriflow-frontend | 5173 | SPA React (Vite dev server)               |
| backend-core    | 3000   | API NestJS (orquestador principal)           |
| backend-math    | 8000   | Motor de cálculos (FastAPI)                  |
| redis-cache     | 6379   | Caché Redis                                  |

## 🚀 Inicio Rápido (Desarrollo)

Para levantar este proyecto en tu entorno local, asegúrate de tener instalado [Docker](https://www.docker.com/), [Git](https://git-scm.com/) y Node.js / Python según corresponda.

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/Unknumb/NutriFlow.git
   cd NutriFlow
   ```

2. **Configuración de Entornos:**
   Deberás configurar las variables de entorno (`.env`) en cada uno de los subproyectos basándote en los archivos `.env.example` proporcionados en cada directorio:
   - `producto/nutriflow-frontend/.env` — `VITE_API_URL` (por defecto `http://localhost:3000`) y claves de Supabase.
   - `producto/backend-core/.env` — `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` y las variables de Upstash Redis.
   - `producto/backend-math/.env` — cadena de conexión a PostgreSQL.

3. **Ejecución con Docker Compose (Recomendado):**
   Levanta `backend-core`, `backend-math` y `redis-cache` de una sola vez. El frontend se ejecuta por separado.

   ```bash
   cd producto
   docker-compose up --build
   ```

4. **Ejecución Manual por Servicios:**
   En caso de querer correr los servicios individualmente para desarrollo:
   - **Frontend:**
     ```bash
     cd producto/nutriflow-frontend
     npm install
     npm run dev
     ```
   - **Backend Core:**
     ```bash
     cd producto/backend-core
     npm install
     npx prisma generate
     npm run start:dev
     ```
   - **Backend Math:**
     ```bash
     cd producto/backend-math
     pip install -r requirements.txt
     uvicorn main:app --reload
     ```

## 🧪 Pruebas

```bash
# Backend Core (NestJS)
cd producto/backend-core
npm run test          # unitarios (Jest)
npm run test:e2e      # end-to-end
npm run test:cov      # cobertura

# Backend Math (FastAPI)
cd producto/backend-math
pytest
```

La documentación de pruebas funcionales y la planilla de casos de prueba se encuentran en la carpeta de gestión del proyecto.

## 👥 Equipo de Desarrollo

- **Alvaro Uribe:** Backend y Base de Datos.
- **Benjamin Gonzalez:** Frontend y otros componentes.
