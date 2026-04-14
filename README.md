# 🍏 NutriFlow

Plataforma SaaS Cloud para la Gestión Integral de Consultas Nutricionales.

## 📖 Sobre el Proyecto

NutriFlow es una aplicación web diseñada a medida para optimizar el flujo de trabajo clínico nutricional. El objetivo principal es automatizar los cálculos metabólicos, digitalizar la distribución visual de porciones y generar sugerencias automáticas de preparaciones, eliminando la dependencia de múltiples planillas de cálculo estáticas.

### ✨ Características Principales

* **Calculadora Inteligente de TMB:** Promedia múltiples fórmulas clínicas de forma automática (Harris-Benedict, Mifflin, etc.).
* **Cuadrador Dinámico de Macronutrientes:** Ajuste en tiempo real basado en pesos de referencia (Ideal, Máximo, Ajustado 25/50%).
* **Armador de Pautas:** Traducción automática de calorías y macros a porciones diarias de intercambio.
* **Pizarra Visual Interactiva:** Sistema *Drag & Drop* para distribuir porciones por tiempos de comida.
* **Generador Automático de Menús:** Algoritmo que sugiere preparaciones filtrando por los rechazos y preferencias del paciente.

## 🛠️ Stack Tecnológico

La arquitectura del proyecto está basada en un modelo Cliente-Servidor (API REST) contenerizado para asegurar alta disponibilidad y escalabilidad:

* **Frontend:** React.js.
* **Backend (Cálculos y Algoritmos):** Python con FastAPI.
* **Backend (Core y Usuarios):** TypeScript con NestJS.
* **Base de Datos:** PostgreSQL.
* **Caché en Memoria:** Redis (para optimizar la reactividad de la interfaz).
* **Infraestructura:** Docker & Docker Compose.

## 🚀 Inicio Rápido (Desarrollo)

Para levantar este proyecto en tu entorno local, asegúrate de tener instalado [Docker](https://www.docker.com/) y [Git](https://git-scm.com/).

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/Unknumb/NutriFlow.git](https://github.com/Unknumb/NutriFlow.git)
