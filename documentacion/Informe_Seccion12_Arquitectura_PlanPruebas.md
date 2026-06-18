# 12. Diseño de arquitectura, ambientes y plan de pruebas

> Contenido formal para actualizar la Sección 12 del informe principal de NutriFlow.
> Redactado para copiarse al documento Word (formato académico).

## 12.1 Diseño de arquitectura

NutriFlow se construyó bajo una **arquitectura de microservicios desacoplada**, organizada en tres
servicios independientes que se comunican mediante HTTP y comparten infraestructura gestionada en la
nube. Esta separación permite que cada componente evolucione y escale de forma autónoma, además de
aislar las responsabilidades según la naturaleza de cada problema (presentación, orquestación de
negocio y cómputo numérico).

- **Capa de presentación — `nutriflow-frontend` (React 19 + Vite + TypeScript).** Aplicación de página
  única (SPA) que constituye la única interfaz con la que interactúa el usuario. Se comunica
  exclusivamente con el backend de orquestación a través de un cliente Axios (`apiClient`) que inyecta
  automáticamente el token de Supabase como cabecera *Bearer* y gestiona de forma centralizada los
  errores 401, 400 y 500. El estado del servidor se cachea con TanStack Query y el armado visual de
  pautas emplea arrastrar y soltar (dnd-kit).

- **Capa de orquestación — `backend-core` (NestJS 11 + TypeScript).** Es el núcleo del sistema: expone
  la API REST, valida la identidad (JWT de Supabase), administra la persistencia mediante Prisma ORM y
  delega los cálculos intensivos al microservicio matemático. Incorpora una capa de caché en Redis para
  resultados costosos y consultas frecuentes, reduciendo la latencia y la carga sobre la base de datos.

- **Capa de cálculo — `backend-math` (FastAPI + Python).** Microservicio especializado en los cálculos
  nutricionales y metabólicos (TMB por Harris-Benedict y Mifflin-St Jeor, cuadrador de
  macronutrientes, distribución de porciones y sugerencia de menús). Su independencia permite optimizar
  el procesamiento numérico y validar automáticamente las entradas mediante Pydantic.

**Flujo de una petición.** El frontend envía la solicitud autenticada a `backend-core`; éste valida el
JWT, resuelve la lógica de negocio y la persistencia, y —cuando se requiere un cálculo— invoca a
`backend-math`. Los resultados reutilizables (por ejemplo, el cuadre de macronutrientes) se almacenan en
Redis con un tiempo de vida acotado, de modo que las peticiones equivalentes se respondan desde la
caché. La identidad se maneja con tokens emitidos por Supabase Auth (HS256), que `backend-core` valida
en cada solicitud; no existe un endpoint local de contraseñas, delegando la gestión de credenciales en
el proveedor gestionado.

## 12.2 Diseño de ambientes

| Ambiente | Descripción | Tecnologías / Servicios |
|---|---|---|
| **Desarrollo local** | Orquestación reproducible de los servicios mediante contenedores. | Docker Compose (`backend-math`:8000, `backend-core`:3000, `redis-cache`:6379); frontend Vite:5173. |
| **Servicios gestionados (cloud)** | Persistencia, identidad y caché como servicios administrados, evitando carga operativa. | PostgreSQL y Auth vía **Supabase**; caché **Redis** vía **Upstash** (REST). |
| **Integración continua** | Respaldo automatizado de la base de datos productiva. | GitHub Actions: `pg_dump` diario (03:00 UTC) publicado como artefacto (retención 7 días). |
| **Producción** | Despliegue de los microservicios y la SPA sobre infraestructura cloud, consumiendo los servicios gestionados anteriores. | Contenedores + Supabase + Upstash. |

La separación de ambientes garantiza que las pruebas y el desarrollo no afecten los datos productivos,
y que la configuración sensible (cadenas de conexión, secretos JWT, credenciales de Redis) se gestione
mediante variables de entorno por ambiente.

## 12.3 Plan de pruebas

La estrategia de calidad combinó **pruebas unitarias automatizadas** y **pruebas funcionales** documentadas,
asegurando tanto la exactitud de la lógica como la cobertura de los flujos de negocio.

**a) Pruebas unitarias automatizadas.** Se implementaron suites en ambos backend:

- *backend-core (Jest):* **9 suites / 32 pruebas en verde**, con dependencias externas (PostgreSQL/Prisma
  y Redis) sustituidas por *mocks*. Cubren la creación de pacientes con invalidación de caché, el manejo
  de errores (404, validaciones), la regla de "una planificación activa por paciente" y la autosugerencia
  de nombres ("Pauta N" / "Planificación N").
- *backend-math (pytest):* **4 pruebas** que verifican que las fórmulas de TMB (Harris-Benedict y
  Mifflin-St Jeor) devuelven el resultado matemático correcto.

**b) Pruebas funcionales.** Se definieron **9 casos de prueba (CP-01 a CP-09)** que recorren los módulos
críticos: autenticación, gestión de pacientes (incluida la validación de RUT chileno por módulo 11),
cálculo de TMB, validación del tope 100% de macronutrientes con tolerancia decimal, armado de pautas con
arrastrar y soltar, y aislamiento de datos por nutricionista. Cada caso se documentó con su
procedimiento, datos de prueba, resultado esperado y resultado obtenido (ver entregable *3.1.3 Planilla
de Casos de Prueba*).

**c) Trazabilidad y ciclos de ejecución.** Los casos se vincularon con los Requisitos Funcionales mediante
una **matriz de trazabilidad** (sin requisitos huérfanos) y se ejecutaron en **dos ciclos**: el Ciclo 1
abordó los flujos núcleo sobre el primer build estabilizado, y el Ciclo 2 re-ejecutó los casos de
validación, manejo de errores y seguridad como pruebas de regresión (ver entregable *3.1.2 Plan de
Pruebas Funcionales*).

**d) Resultado.** La totalidad de las pruebas unitarias se encuentra en verde y los nueve casos
funcionales resultaron conformes (OK), lo que constituye la evidencia objetiva de la calidad alcanzada
por el sistema previo a su entrega.

## 12.4 Mejora arquitectónica relevante: separación de `Pauta` y `Planificacion`

Como parte de la evolución del modelo de datos se realizó la **separación estricta de las entidades
`Planificacion` y `Pauta`**, que originalmente se encontraban acopladas. La entidad **`Planificacion`**
concentra el *objetivo nutricional* (calorías totales, distribución de macronutrientes y la marca de
planificación activa del paciente), mientras que la entidad **`Pauta`** representa la *materialización*
de ese objetivo en una grilla concreta de tiempos de comida y porciones. Una `Planificacion` puede
agrupar **varias** `Pauta` (relación uno-a-muchos mediante `planificacion_id`), lo que permite mantener
distintas versiones de pauta bajo un mismo objetivo, conservar una única planificación activa por
paciente y mejorar la trazabilidad clínica del historial nutricional. Esta normalización se refleja en
el Diagrama de Clases y en el Modelo Relacional actualizados.
