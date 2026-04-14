# 🍏 NutriFlow

Plataforma SaaS Cloud para la Gestión Integral de Consultas Nutricionales.

## 📖 Sobre el Proyecto

[cite_start]NutriFlow es una aplicación web diseñada a medida para optimizar el flujo de trabajo clínico nutricional[cite: 2407]. [cite_start]El objetivo principal es automatizar los cálculos metabólicos, digitalizar la distribución visual de porciones y generar sugerencias automáticas de preparaciones, eliminando la dependencia de múltiples planillas de cálculo estáticas[cite: 2408, 2546].

### ✨ Características Principales

* [cite_start]**Calculadora Inteligente de TMB:** Promedia múltiples fórmulas clínicas de forma automática (Harris-Benedict, Mifflin, etc.)[cite: 2409].
* [cite_start]**Cuadrador Dinámico de Macronutrientes:** Ajuste en tiempo real basado en pesos de referencia (Ideal, Máximo, Ajustado 25/50%)[cite: 2410].
* [cite_start]**Armador de Pautas:** Traducción automática de calorías y macros a porciones diarias de intercambio[cite: 2411].
* [cite_start]**Pizarra Visual Interactiva:** Sistema *Drag & Drop* para distribuir porciones por tiempos de comida[cite: 2412].
* [cite_start]**Generador Automático de Menús:** Algoritmo que sugiere preparaciones filtrando por los rechazos y preferencias del paciente[cite: 2412].

## 🛠️ Stack Tecnológico

[cite_start]La arquitectura del proyecto está basada en un modelo Cliente-Servidor (API REST) contenerizado para asegurar alta disponibilidad y escalabilidad[cite: 2578]:

* [cite_start]**Frontend:** React.js[cite: 2563].
* [cite_start]**Backend (Cálculos y Algoritmos):** Python con FastAPI[cite: 2564].
* [cite_start]**Backend (Core y Usuarios):** TypeScript con NestJS[cite: 2564].
* [cite_start]**Base de Datos:** PostgreSQL[cite: 2565].
* [cite_start]**Caché en Memoria:** Redis (para optimizar la reactividad de la interfaz)[cite: 2501].
* [cite_start]**Infraestructura:** Docker & Docker Compose[cite: 2566].

## 🚀 Inicio Rápido (Desarrollo)

Para levantar este proyecto en tu entorno local, asegúrate de tener instalado [Docker](https://www.docker.com/) y [Git](https://git-scm.com/).

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/Unknumb/NutriFlow/tree/develop](https://github.com/Unknumb/NutriFlow/tree/develop)