# Auditoría completa del frontend — NutriFlow (2026-06-29)

Auditoría del flujo completo de la nutricionista **(login → ficha de pacientes / alta → planificación → catálogo)**, combinando:

- **Recorrido en vivo con Playwright** sobre el stack completo levantado localmente (frontend Vite + backend-core NestJS + backend-math FastAPI + Supabase/Redis reales), con captura de pantalla, errores de consola y requests de red en cada paso.
- **Revisión de código** del frontend con 3 auditores en paralelo (módulo Pacientes, cadena de Planificación, Catálogo + capa Shared/Shell/Auth), leyendo los archivos completos y contrastando contra `REDISENO.md` y `AUDITORIA_UX.md`.

Se creó y **eliminó** un paciente de prueba (`TEST AUDITORIA Eliminar`) para ejercitar el alta real. La base de datos quedó limpia (paciente y planificación borrados; ver nota de limpieza al final).

---

## Resumen ejecutivo

El **rediseño visual de `REDISENO.md` está implementado y es sólido**: tokens `@theme`, sidebar pino con grupos Clínica/Planificación/Catálogo, login split-screen, `FlowStepper` que guía Macros→Pautas→Porciones, y los **P0 de la auditoría anterior están cerrados** (pesos de referencia reales, generador funcional, persistencia de pauta, PDF con colores de macro, fechas TZ-safe). El flujo feliz funciona de punta a punta **sin errores de consola ni requests 4xx/5xx**.

Pero hay **un P0 nuevo y verificable**: el dato clínico falso volvió por la puerta de atrás. El store clínico persiste `tmbPromedio: 1766` / `pesoActivo: 67.4` como **valores por defecto** y no recalcula la TMB al activar un paciente. Como el `FlowStepper` arranca en **Macronutrientes** (que omite el Dashboard, único lugar donde se calcula la TMB), una nutricionista que siga el flujo planifica y **guarda una planificación construida sobre una TMB fabricada**. Lo reproduje en vivo: para un paciente de 62 kg / 165 cm / 36 a (TMB real **1319 kcal**), Macronutrientes mostró y guardó **1766 kcal** — un error de **+447 kcal/día**.

Lo demás son frenos de robustez transversal (sin ErrorBoundary, errores 4xx/5xx que no se muestran al usuario, validación de antropometría que acepta valores negativos/cero) y pulido del rediseño aún pendiente.

---

## P0 — Crítico: corregir antes de uso clínico real

### P0-1. TMB por defecto contaminada → se planifica y guarda sobre calorías fabricadas
**Evidencia en vivo (reproducido):**
1. Creé el paciente 62 kg / 165 cm / 36 a / F y lo activé.
2. Entré directo a **Macronutrientes** (paso 1 del stepper): mostró **1766 kcal** como "Calorías Totales Objetivo" y **guardé** la planificación con ese valor (`POST /planificaciones 201`, `calorias_totales: 1766`, confirmado leyendo el registro en DB).
3. Visité el **Dashboard**: la TMB real del paciente es **1319 kcal** (Harris-Benedict 1376.2, Mifflin 1310.2, Owen 1240.2, Oxford 1297.9, FAO/OMS 1368.4 → promedio 1319).
4. Volví a Macronutrientes: **sin tocar nada**, ahora mostraba **1319**. El número cambió solo por haber pasado por el Dashboard.

**Causa (código):** `shared/store/useClinicalStore.ts:31,41` — defaults `pesoActivo: 67.4`, `tmbPromedio: 1766` (los mismos números "inventados" del P0-1/P0-2 previo). `setActivePatient` actualiza el peso pero **no** la TMB; solo el `useEffect` de `TmbCalculatorCard` (exclusivo del Dashboard) la recalcula. `useMacronutrientsSetup.handleSave` usa ese `tmbPromedio` para `calorias_totales`.

**Impacto:** planificación clínica guardada sobre una TMB falsa o contaminada del paciente anterior. Es el hallazgo más grave.

**Fix:** inicializar el store en `0/0` (no en 67.4/1766); recalcular o resetear `tmbPromedio` al activar paciente; mover el cálculo de TMB fuera del Dashboard (o ejecutarlo en `setActivePatient`); bloquear "Guardar planificación" si la TMB no proviene del paciente activo.

### P0-2. La card "Distribución de Macronutrientes" del Dashboard nunca muestra su estado vacío
`features/calculos/components/MacrosCard.tsx:19` — el guard es `sinDatos = tmbPromedio <= 0 || pesoActivo <= 0`. Como el store nunca baja de los defaults (1766/67.4), `sinDatos` es **siempre false** y la card muestra una distribución plausible aunque el paciente no tenga TMB real. Anula en la práctica el arreglo P0-2 de la auditoría previa.
**Fix:** derivar `MacrosCard` de `useObjetivosActivos` (planificación persistida) y mostrar vacío cuando no hay planificación.

### P0-3. Antropometría negativa / cero aceptada como dato clínico
**Evidencia en vivo:** el paciente `Pedro Sanchez` existe con **Talla −1 cm** y **Peso −50 kg** mostrados como datos clínicos en la ficha.
**Causa (código):** `ModalNuevoPaciente.tsx:69-70` — `camposObligatoriosOk` evalúa `talla_cm`/`peso_kg` como **string**, por lo que `"0"` (y negativos) pasan la validación; el `<input type="date">` de nacimiento no tiene `max`, permitiendo fechas futuras (edad 0/negativa); y al no envolver en `<form>`, la validación nativa de `type="email"` nunca dispara.
**Fix:** validar `Number(talla) > 0` y `Number(peso) > 0`, `max={hoy}` en la fecha, y validar email/teléfono explícitamente.

---

## P1 — Importante: fricción seria, accesibilidad o robustez

### Datos placeholder / inventados en la lista de pacientes
- **P1-1. Chip de peso "– kg" para todos.** *(Verificado en vivo: mi paciente con 62 kg en la ficha mostró "– kg" en la lista.)* `FichasPacientes.tsx:202-204` lo tiene hardcodeado pese a que el dato está en `paciente.Evaluacion?.[0]?.peso_actual`. (Hallazgo #8 del audit previo, sigue abierto.)
- **P1-2. Chip "0 síntomas" fijo.** `FichasPacientes.tsx:205-207` — no existe funcionalidad de síntomas; afirma un dato clínico ("cero síntomas reportados") sobre un sistema que no los registra.

### Robustez transversal
- **P1-3. No hay ErrorBoundary en toda la app** (`app/main.tsx`, `App.tsx`). Cualquier excepción de render deja pantalla en blanco sin recuperación.
- **P1-4. Los errores 4xx/5xx/red no se muestran al usuario.** `shared/api/apiClient.ts:38-49` solo hace `console.error`; no hay sistema de toast (cero deps de toast/sonner). El manejo "global" se limita a logs.
- **P1-5. El generador de menús falla en silencio.** `features/menus/hooks/useMenus.ts` + `GeneradorPreparaciones.tsx:49` — `useGenerarMenu` no expone `isError`; si `/menus/generar` falla, la UI vuelve al estado vacío como si nada. (Relacionado: `apiClient` tiene `timeout: 10000` global que puede abortar generaciones legítimas de backend-math.)
- **P1-6. Mutaciones de evaluación sin `onError`.** `FichasPacientes.tsx:503-517` — guardar una evaluación (dato clínico) que falla reactiva el botón sin avisar: pérdida silenciosa.

### Estado / fuente de verdad
- **P1-7. Caché stale tras nueva evaluación.** `useEvaluaciones.ts:28-53` invalida solo `pacientesKeys.evaluaciones(id)`, nunca `all`/`detail`; como "Datos Personales" lee peso/talla de `paciente.Evaluacion?.[0]`, la talla/peso quedan stale hasta refetch del listado.
- **P1-8. Dos fuentes de verdad para los objetivos.** `pages/pautas/index.tsx` — Porciones y PDF usan `useObjetivosActivos` (planificación activa en DB), pero el Armador usa el **borrador de localStorage** + TMB de sesión. Cambiar el `PlanificacionSelector` no altera los targets del Armador. `useDietPlanBuilder.ts:12` congela los targets en el primer montaje (sin sync a cambios).
- **P1-9. Casillas "Grupos de Alimentos" (control muerto).** `PortionsConfigPanel.tsx:135-148` — alternan `activeGroups` en el store pero **ningún render lo consume** (las tablas filtran por `targets[g.id] > 0`). Desmarcar "Cereales" no oculta nada.
- **P1-10. Checkbox "Recordar datos para la próxima sesión" (control muerto).** `PatientInfoCard.tsx:211-215` — sin estado ni handler. *(Visto en vivo en Dashboard.)* (P1 #6 previo, sigue abierto.)
- **P1-11. `usePortions()` se instancia 6 veces**, cada una con su `selectedPautaId` y dos `useEffect` que escriben el store global — frágil (divergencia de selección) y desperdicia renders.

### Accesibilidad
- **P1-12. Filas de paciente no operables por teclado.** `FichasPacientes.tsx:176-187` — `<div onClick>` sin `role`/`tabIndex`/`onKeyDown`.
- **P1-13. Modales sin semántica de diálogo.** `ModalNuevoPaciente.tsx:111-126` y modal "Agregar grupo de alimento" — sin `role="dialog"`/`aria-modal`, focus trap, retorno de foco ni cierre con Escape (los modales de Guardar sí lo tienen).
- **P1-14. Inputs de búsqueda sin label/aria-label** (Biblioteca, Alimentos) — solo `placeholder`. El foco de búsqueda de Biblioteca usa `ring-mist`, casi invisible.

### PDF
- **P1-15. La fecha del PDF reintroduce el off-by-one ya corregido.** `FichasPacientes.tsx:773-786` usa `new Date(pauta.fecha_creacion)` + `Intl` en vez de `formatearFechaLarga`; el documento clínico puede salir con fecha un día atrás (regresión del P0-4 previo).

### No se puede borrar un paciente desde la UI
- **P1-16.** Ni la lista ni la ficha ofrecen eliminar un paciente. La ruta `DELETE /pacientes/:id` existe en el backend, pero no hay affordance en el frontend: un paciente creado por error queda sin forma de removerse sin acceso a la base. *(Detectado al intentar limpiar el paciente de prueba.)*

---

## P2 — Pulido y consistencia con REDISENO

- **P2-1. Colores de macro inconsistentes en la ficha.** `FichasPacientes.tsx:619-655` (tab Pautas) usa rojo/azul/amarillo para Proteínas/CHO/Grasas — peor, CHO en azul, que es el color de Proteínas en el resto de la app. El resto de pantallas (Macronutrientes, charts, PDF) ya usan la paleta semántica correcta.
- **P2-2. Biblioteca: imágenes rotas + chips pastel aleatorios.** *(Verificado en vivo: las 21 preparaciones muestran placeholder roto.)* Chips de ingredientes con colores rotando por índice, incluido `bg-purple-100` (REDISENO manda eliminar morado / alinear a paleta de grupos). Badge "Sistema" en `--pine` aquí vs `--mist` en el Generador (divergente).
- **P2-3. Emojis y hex fuera de token en el Generador.** `GeneradorPreparaciones.tsx` — emojis `1️⃣2️⃣3️⃣` y de grupo, `text-[#8a5a2a]`, `text-sky-700`. REDISENO prohíbe emojis en UI. *(En vivo: los badges 1-2-3 del empty state salen azules, fuera de paleta.)*
- **P2-4. Dos cards de preparación divergentes** para el mismo dato (`BibliotecaPreparaciones` vs `GeneradorPreparaciones`) — extraer un `<PreparacionCard>` único.
- **P2-5. `window.confirm()` nativo para borrar** en Biblioteca/Alimentos, mientras el logout usa modal del sistema — inconsistente.
- **P2-6. Focus ring divergente.** Patrón general `focus:ring-pine-soft` en inputs (Pacientes, Preparaciones, Auth) en vez del `--apricot` que define REDISENO (regla 4). Decidir uno y documentarlo.
- **P2-7. Sliders de macros sin `aria-label`** (`MacronutrientSetupCard.tsx:87-98`); el track está hardcodeado a pino en vez del color del macro (`:96`).
- **P2-8. Objetivos `readOnly` que parecen editables.** `NutritionTargetsPanel.tsx:29-32` los renderiza como `input` con `focus:ring`. Además `getPct` (`:12`) divide por target sin proteger el 0 → barras a 100% con meta 0.
- **P2-9. Tabs de la ficha sin ARIA** (`role="tablist"/"tab"/"tabpanel"`); labels sin `htmlFor`/`id` en ModalNuevoPaciente y DatosPersonales (MiPerfil sí lo hace bien y sirve de modelo).
- **P2-10. Pluralización "{n} pacientes en seguimiento"** (`FichasPacientes.tsx:142`) — "1 pacientes". *(En vivo con 8–9 pacientes no se nota, pero el código no pluraliza.)*
- **P2-11. Paleta cruda de Tailwind** (`emerald/red/amber/yellow`, `defaultValue="#14b8a6"` teal heredado, verde "Conectado" `#3C9A6E`) en Porciones/VistaPauta/pizarra — alinear a tokens.
- **P2-12. Generador no pre-selecciona el paciente activo** en su selector "Paciente (opcional)". *(En vivo.)*
- **P2-13. Código muerto:** `shared/ui/atoms/Button.tsx` (0 importadores, mientras los botones se reescriben inline en cada pantalla), `features/pacientes/components/PatientInfoCard.tsx` (prototipo con datos falsos "Juan Pérez", no importado), `macronutrientsApi.ts:saveMacronutrients`, `DietPlanSummary.tsx`, `MealCard.tsx`.
- **P2-14. Input de contraseña sin `autocomplete`** (warning de consola en `/login`: *"Input elements should have autocomplete attributes"*).
- **P2-15. Warning de recharts** *(en vivo, Macronutrientes)*: `The width(-1) and height(-1) of chart should be greater than 0` en el render inicial del `ResponsiveContainer`.
- **P2-16. Etiqueta del gráfico** *(en vivo)*: el pie de Macronutrientes rotula "hidratos" en minúscula vs "Proteínas/Grasas" capitalizadas.
- **P2-17. Patrón `setState` dentro de `useEffect`** en `TmbCalculatorCard.tsx:33-35` (sobrescribe el override manual de calorías al revisitar Dashboard), `PatientInfoCard.tsx:28-37` — refactor a estado derivado/`key`.
- **P2-18. Mismatch de longitud de contraseña** (Register/Reset exigen ≥8 pero el mensaje traducido de Supabase dice ≥6).

---

## Hallazgos de backend descubiertos durante la auditoría

Aparecieron al ejercitar el alta y la limpieza; no son del frontend pero impactan la integridad de datos:

- **B-1. `DELETE /pacientes` no invalida la caché Redis de planificaciones.** `findAll` cachea `planificaciones:${userId}` por 1h (`planificaciones.service.ts:95-123`) y solo se invalida en `create`/`setActiva`/`remove` del propio módulo. Al borrar un paciente (que sí elimina sus planificaciones en cascada en la DB), la lista cacheada sigue mostrando la planificación huérfana hasta 1h. **Fix:** invalidar `planificaciones:${userId}` también desde el borrado de paciente.
- **B-2. `DELETE /planificaciones/:id` sobre un id inexistente devuelve 500.** `planificaciones.service.ts:125-139` no captura `PrismaClientKnownRequestError` (P2025) → debería ser `404 NotFound`. Además lanza **antes** del `redis.del`, así que tampoco limpia la caché stale.

---

## Lo que está bien (verificado en vivo + código)

- **Rediseño REDISENO implementado:** `@theme` completo con todos los tokens (sin morado `#aa3bff` heredado), fuentes Google, focus ring global y `prefers-reduced-motion`; sidebar pino con grupos; login split-screen sin glassmorphism; `PageHeader` con eyebrow.
- **P0 de la auditoría previa cerrados:** Pesos de Referencia reales (IMC 22.8, peso ideal 59.9 kg calculados por paciente), Generador ya no decorativo (lee porciones reales, empty-state con CTA), persistencia real de pauta y planificación, PDF con colores de macro, fechas TZ-safe (`shared/utils/fechas.ts`).
- **Guía de flujo nueva:** `FlowStepper` (Macros→Pautas→Porciones), `PlanificacionSelector`, planificaciones con nombre sugerido, empty-states que enlazan al paso anterior.
- **RUT chileno robusto:** validación módulo-11 espejo del backend, formateo en vivo, bloqueo de guardado con RUT inválido.
- **Capa de datos del catálogo de primer nivel:** búsqueda server-side, debounced, paginada, con `keepPreviousData`; manejo de 409 (duplicado/en uso); flujo de imágenes con validación de tamaño/MIME y limpieza de huérfanas.
- **Lenguaje de macros consistente y tokenizado** (`shared/ui/macroColors.ts` = `globals.css` = charts + PDF), salvo la excepción de la ficha (P2-1).
- **Sin errores de consola ni requests 4xx/5xx** en todo el flujo feliz.

---

## Plan de acción priorizado

| Prioridad | Acción | Esfuerzo |
|---|---|---|
| **1** | P0-1/P0-2: arreglar `useClinicalStore` (defaults 0/0, recalcular TMB al activar paciente, bloquear guardado sin TMB del paciente activo) | M |
| **2** | P0-3: validar antropometría (`>0`, `max` en fecha, email) en `ModalNuevoPaciente` | S |
| **3** | P1-1/P1-2: leer peso real en el chip de la lista; eliminar "0 síntomas" | S |
| **4** | P1-3/P1-4/P1-5/P1-6: ErrorBoundary global + sistema de toast + surfacing de 4xx/5xx + `onError` en mutaciones clínicas | M |
| **5** | P1-8/P1-9/P1-10: unificar fuente de verdad de objetivos (todo desde `useObjetivosActivos`); quitar/implementar controles muertos | M |
| **6** | P1-12/P1-13/P1-14: accesibilidad (filas por teclado, semántica de diálogo, labels de búsqueda) | M |
| **7** | B-1/B-2: invalidación de caché en borrado de paciente; 404 en delete de planificación inexistente | S |
| **8** | Barrido P2: paleta de macros en ficha, chips/imágenes de Biblioteca, emojis/hex del Generador, código muerto, focus ring | M |

---

### Nota de limpieza
Paciente de prueba `TEST AUDITORIA Eliminar` (`0873e7aa-…`) y su planificación (`5910a1ef-…`, la que quedó guardada con el 1766 fabricado) **eliminados de la base** (`DELETE /pacientes` → 200; Prisma confirma que la planificación ya no existe, borrada en cascada). Queda una entrada de caché Redis stale (`planificaciones:<userId>`) que **auto-expira en ≤1 h** — intenté invalidarla manualmente pero es una escritura a infraestructura de producción que preferí no forzar (ver B-1: el propio backend debería invalidarla).
