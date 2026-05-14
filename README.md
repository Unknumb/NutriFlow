# 🍏 NutriFlow

Plataforma SaaS Cloud para la Gestión Integral de Consultas Nutricionales.

## 📖 Sobre el Proyecto

NutriFlow es una aplicación web diseñada a medida para optimizar el flujo de trabajo clínico nutricional. El objetivo principal es automatizar los cálculos metabólicos, digitalizar la distribución visual de porciones y generar sugerencias automáticas de preparaciones, eliminando la dependencia de múltiples planillas de cálculo estáticas.

### ✨ Características Principales y Avances

Durante el desarrollo del proyecto, hemos consolidado la arquitectura y completado múltiples hitos importantes:

* **Estabilización de Arquitectura:** Migración completa y puesta en marcha de todos los servicios (frontend, backend-core y backend-math) de manera orquestada.
* **Integración del Dashboard Clínico:** Interfaz centralizada para la gestión de pacientes y consultas.
* **Calculadora Inteligente de TMB (Backend Math):** Módulo matemático en FastAPI completamente funcional que promedia múltiples fórmulas clínicas (Harris-Benedict, Mifflin, etc.) para el cálculo de la Tasa Metabólica Basal.
* **Orquestación de Microservicios:** Comunicación fluida y endpoints integrados entre el backend principal en NestJS y el motor matemático en Python.
* **Gestión de Base de Datos:** Implementación de Prisma ORM en NestJS y SQLAlchemy en FastAPI con PostgreSQL, incluyendo endpoints funcionales para la consulta de datos alimentarios.
* **Cuadrador Dinámico de Macronutrientes:** Ajuste en tiempo real basado en pesos de referencia.
* **Pizarra Visual Interactiva & Armador de Pautas:** Sistema *Drag & Drop* para distribuir porciones por tiempos de comida.

## 🛠️ Stack Tecnológico Actualizado

La arquitectura del proyecto está basada en un modelo de microservicios contenerizado para asegurar alta disponibilidad y escalabilidad, utilizando las siguientes tecnologías:

### 🎨 Frontend (`nutriflow-frontend`)
* **Framework:** React 19 con Vite.
* **Estilos:** TailwindCSS v4.
* **Estado y Fetching:** Zustand, React Query (`@tanstack/react-query`).
* **Enrutamiento:** React Router (`@tanstack/react-router`).
* **Autenticación y Servicios:** Supabase (`@supabase/supabase-js`).

### ⚙️ Backend Core (`backend-core`)
* **Framework:** TypeScript con NestJS 11.
* **ORM:** Prisma ORM (`@prisma/client`, `@prisma/adapter-pg`).
* **Base de Datos:** PostgreSQL.
* **Autenticación:** Passport, JWT, Supabase.
* **Documentación:** Swagger / OpenAPI (`@nestjs/swagger`).

### 🧮 Backend Math (`backend-math`)
* **Framework:** Python con FastAPI.
* **ORM:** SQLAlchemy (con `psycopg2`).
* **Base de Datos:** PostgreSQL.
* **Servidor ASGI:** Uvicorn.
* **Validación de Datos:** Pydantic.

### 🐳 Infraestructura y Herramientas Adicionales
* **Contenedores:** Docker & Docker Compose.
* **Caché en Memoria:** Redis (para optimizar la reactividad de la interfaz).
* **Versionamiento:** Git / GitHub.

## 🚀 Inicio Rápido (Desarrollo)

Para levantar este proyecto en tu entorno local, asegúrate de tener instalado [Docker](https://www.docker.com/), [Git](https://git-scm.com/) y Node.js / Python según corresponda.

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/Unknumb/NutriFlow.git
   cd NutriFlow
   ```

2. **Configuración de Entornos:**
   Deberás configurar las variables de entorno (`.env`) en cada uno de los subproyectos basándote en los archivos `.env.example` proporcionados en cada directorio:
   * `producto/nutriflow-frontend/.env`
   * `producto/backend-core/.env`
   * `producto/backend-math/.env`

3. **Ejecución con Docker Compose (Recomendado):**
   Si el proyecto cuenta con un archivo `docker-compose.yml` configurado para todo el stack en la carpeta `producto`:
   ```bash
   cd producto
   docker-compose up --build
   ```

4. **Ejecución Manual por Servicios:**
   En caso de querer correr los servicios individualmente para desarrollo:
   
   * **Frontend:**
     ```bash
     cd producto/nutriflow-frontend
     npm install
     npm run dev
     ```
   * **Backend Core:**
     ```bash
     cd producto/backend-core
     npm install
     npm run start:dev
     ```
   * **Backend Math:**
     ```bash
     cd producto/backend-math
     pip install -r requirements.txt
     uvicorn main:app --reload
     ```

## 👥 Equipo de Desarrollo

* **Alvaro Uribe:** Backend y Base de Datos.
* **Benjamin Gonzalez:** Frontend y otros componentes.
