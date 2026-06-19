# Definición de los Casos de Pruebas — NutriFlow

> Fichas detalladas para la sección **"Definición de los Casos de Pruebas"** del documento
> *3.1.2 Plan de Pruebas Funcionales*. Cada ficha sigue la estructura formal de la plantilla
> (Nombre / Código / Descripción / Prerrequisitos / Pasos / Resultado esperado / Resultado obtenido).
> Estado de ejecución: **OK** = el ítem cumple lo indicado.

---

### CP-01 — Inicio de sesión con credenciales válidas

| Campo | Detalle |
|---|---|
| **Nombre del caso de prueba** | Inicio de sesión con credenciales válidas |
| **Código del CP** | CP-01 |
| **Caso de uso asociado** | Iniciar sesión |
| **Módulo / Funcionalidad** | Autenticación (Supabase Auth) / Funcional |
| **Si / No (Resultado)** | **OK** |
| **Descripción** | Verificar que un nutricionista registrado pueda autenticarse e ingresar al sistema con un email y contraseña válidos. |
| **Prerrequisitos** | Existe un usuario/nutricionista registrado y activo en Supabase Auth. |
| **Datos de prueba** | email: `nutri@nutriflow.cl` — contraseña válida. |
| **Pasos** | 1) Abrir la pantalla `/login`. 2) Ingresar email y contraseña. 3) Presionar "Iniciar sesión". |
| **Resultado esperado** | Supabase emite un JWT; el frontend lo almacena e inyecta como Bearer, y redirige al dashboard del nutricionista. |
| **Resultado obtenido** | Acceso correcto; se muestra el dashboard del nutricionista. |

---

### CP-02 — Rechazo de credenciales inválidas

| Campo | Detalle |
|---|---|
| **Nombre del caso de prueba** | Rechazo de credenciales inválidas |
| **Código del CP** | CP-02 |
| **Caso de uso asociado** | Iniciar sesión |
| **Módulo / Funcionalidad** | Autenticación / Validación |
| **Si / No (Resultado)** | **OK** |
| **Descripción** | Verificar que el sistema rechace el ingreso cuando las credenciales son incorrectas y no emita token. |
| **Prerrequisitos** | Existe el usuario; se conoce su email pero se usa una contraseña errónea. |
| **Datos de prueba** | email válido + contraseña incorrecta. |
| **Pasos** | 1) Abrir `/login`. 2) Ingresar el email correcto y una contraseña errónea. 3) Enviar. |
| **Resultado esperado** | No se emite token; se muestra un mensaje de error y el usuario permanece en `/login`. |
| **Resultado obtenido** | El sistema informa credenciales inválidas y no permite el ingreso. |

---

### CP-03 — Alta de paciente con datos válidos

| Campo | Detalle |
|---|---|
| **Nombre del caso de prueba** | Alta de paciente con datos válidos |
| **Código del CP** | CP-03 |
| **Caso de uso asociado** | Crear paciente |
| **Módulo / Funcionalidad** | Pacientes / Funcional |
| **Si / No (Resultado)** | **OK** |
| **Descripción** | Verificar la creación de un paciente con RUT válido y la generación automática de su evaluación inicial (peso/talla). |
| **Prerrequisitos** | Nutricionista autenticado. |
| **Datos de prueba** | Juan Pérez, nac. 1990-05-20, 175 cm, 70 kg, RUT 12.345.678-5. |
| **Pasos** | 1) Ir a Pacientes → "Nuevo paciente". 2) Completar datos personales + talla y peso. 3) Guardar. |
| **Resultado esperado** | Paciente creado y asociado al nutricionista; se crea su evaluación inicial; se invalida la caché y el paciente aparece en la lista. |
| **Resultado obtenido** | Paciente creado correctamente y visible en el listado. |

---

### CP-04 — Validación de RUT inválido

| Campo | Detalle |
|---|---|
| **Nombre del caso de prueba** | Validación de RUT con dígito verificador inválido |
| **Código del CP** | CP-04 |
| **Caso de uso asociado** | Crear paciente |
| **Módulo / Funcionalidad** | Pacientes / Validación |
| **Si / No (Resultado)** | **OK** |
| **Descripción** | Verificar que el sistema rechace un RUT cuyo dígito verificador (módulo 11) sea incorrecto. |
| **Prerrequisitos** | Nutricionista autenticado; formulario de nuevo paciente abierto. |
| **Datos de prueba** | RUT 12.345.678-0 (el DV correcto es 5). |
| **Pasos** | 1) "Nuevo paciente". 2) Ingresar un RUT con DV errado. 3) Guardar. |
| **Resultado esperado** | HTTP 400 con el mensaje: *"El RUT ingresado no es válido (verifica el dígito verificador)"*; no se crea el paciente. |
| **Resultado obtenido** | El sistema bloquea el guardado y muestra el mensaje de RUT inválido. |

---

### CP-05 — Cálculo de TMB (Harris-Benedict)

| Campo | Detalle |
|---|---|
| **Nombre del caso de prueba** | Cálculo de Tasa Metabólica Basal por Harris-Benedict |
| **Código del CP** | CP-05 |
| **Caso de uso asociado** | Calcular requerimiento energético |
| **Módulo / Funcionalidad** | Calculadora metabólica (backend-math) / Funcional |
| **Si / No (Resultado)** | **OK** |
| **Descripción** | Verificar que la TMB calculada por la fórmula de Harris-Benedict coincida con el resultado matemático esperado. |
| **Prerrequisitos** | Paciente con datos antropométricos cargados. |
| **Datos de prueba** | Sexo M, 30 años, 175 cm, 70 kg. |
| **Pasos** | 1) Abrir la evaluación del paciente. 2) Ingresar sexo, edad, talla y peso. 3) Calcular TMB. |
| **Resultado esperado** | TMB = **1695,7 kcal**  `(88,362 + 13,397·70 + 4,799·175 − 5,677·30)`. |
| **Resultado obtenido** | El sistema devuelve 1695,7 kcal en el panel de resultados. |

---

### CP-06 — Tope 100% de macronutrientes (rechazo)

| Campo | Detalle |
|---|---|
| **Nombre del caso de prueba** | Validación del tope 100% en la distribución de macros |
| **Código del CP** | CP-06 |
| **Caso de uso asociado** | Cuadrar macronutrientes |
| **Módulo / Funcionalidad** | Cuadrador de macros (backend-math) / Validación |
| **Si / No (Resultado)** | **OK** |
| **Descripción** | Verificar que la suma de los porcentajes de proteína, grasa y carbohidrato deba ser 100%. |
| **Prerrequisitos** | Planificación de macros en estrategia "porcentajes". |
| **Datos de prueba** | proteína 40%, grasa 40%, carbohidrato 30% (suma = 110). |
| **Pasos** | 1) Macronutrientes → estrategia "porcentajes". 2) Ingresar 40 / 40 / 30. 3) Calcular. |
| **Resultado esperado** | Error de validación: *"Los porcentajes deben sumar 100. Suma actual: 110"*; no se calcula la distribución. |
| **Resultado obtenido** | El sistema rechaza y solicita corregir la distribución. |

---

### CP-07 — Tolerancia decimal de macronutrientes (aceptación)

| Campo | Detalle |
|---|---|
| **Nombre del caso de prueba** | Aceptación dentro de la tolerancia decimal de macros |
| **Código del CP** | CP-07 |
| **Caso de uso asociado** | Cuadrar macronutrientes |
| **Módulo / Funcionalidad** | Cuadrador de macros (backend-math) / Funcional |
| **Si / No (Resultado)** | **OK** |
| **Descripción** | Verificar que el sistema acepte distribuciones cuya suma quede dentro del rango [99,9 – 100,1], evitando falsos rechazos por errores de coma flotante. |
| **Prerrequisitos** | Planificación de macros en estrategia "porcentajes". |
| **Datos de prueba** | 33,3 / 33,3 / 33,4 (suma = 100,0). |
| **Pasos** | 1) Estrategia "porcentajes". 2) Ingresar 33,3 / 33,3 / 33,4. 3) Calcular. |
| **Resultado esperado** | Se acepta la suma (dentro de [99,9; 100,1]) y se devuelven los gramos y calorías por macronutriente. |
| **Resultado obtenido** | Cálculo realizado correctamente, sin falso rechazo por redondeo. |

---

### CP-08 — Arrastrar y soltar en la pizarra

| Campo | Detalle |
|---|---|
| **Nombre del caso de prueba** | Reubicar un alimento entre tiempos de comida (drag & drop) |
| **Código del CP** | CP-08 |
| **Caso de uso asociado** | Armar pauta |
| **Módulo / Funcionalidad** | Pizarra / Armador de pauta (frontend, dnd-kit) / Funcional |
| **Si / No (Resultado)** | **OK** |
| **Descripción** | Verificar que un alimento pueda moverse de un tiempo de comida a otro mediante arrastrar y soltar, recalculando los aportes. |
| **Prerrequisitos** | Pauta abierta con al menos un alimento asignado a un tiempo de comida. |
| **Datos de prueba** | Alimento "Manzana": origen Colación → destino Desayuno. |
| **Pasos** | 1) Abrir la pizarra de la pauta. 2) Arrastrar "Manzana" desde Colación hasta Desayuno. 3) Soltar. |
| **Resultado esperado** | El alimento queda en el tiempo destino y se recalculan los aportes (kcal/macros) del tiempo de comida. |
| **Resultado obtenido** | El ítem se reubica y los totales del tiempo se actualizan. |

---

### CP-09 — Aislamiento de datos por nutricionista

| Campo | Detalle |
|---|---|
| **Nombre del caso de prueba** | Aislamiento de datos entre nutricionistas (multi-tenant) |
| **Código del CP** | CP-09 |
| **Caso de uso asociado** | Consultar paciente |
| **Módulo / Funcionalidad** | Pacientes / Seguridad |
| **Si / No (Resultado)** | **OK** |
| **Descripción** | Verificar que un nutricionista no pueda acceder a pacientes que pertenecen a otro nutricionista. |
| **Prerrequisitos** | Dos nutricionistas (A y B); B tiene al menos un paciente. |
| **Datos de prueba** | id de un paciente perteneciente al Nutricionista B. |
| **Pasos** | 1) Autenticarse como Nutricionista A. 2) Solicitar `GET /pacientes/{id}` de un paciente de B. |
| **Resultado esperado** | HTTP 404: *"Paciente con ID … no encontrado o no tienes permisos de acceso"*. |
| **Resultado obtenido** | Acceso denegado correctamente (404). |
