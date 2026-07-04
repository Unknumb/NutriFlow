# Análisis de Normalización de la Base de Datos NutriFlow (1FN → 3FN)

**Fecha:** 2026-07-03
**Fuente de verdad:** `producto/backend-core/prisma/schema.prisma` (PostgreSQL en Supabase)
**Alcance:** las 11 tablas de dominio del schema `public`. El schema `auth` (usuarios, sesiones, MFA, OAuth, SSO) es gestionado por Supabase Auth y queda fuera del análisis: no lo diseñamos nosotros y no debe modificarse.

---

## 1. Modelo relacional (schema `public`)

| Tabla | PK | FKs | Clave candidata natural |
|---|---|---|---|
| `perfiles_nutricionistas` | `id` (UUID, = `auth.users.id`) | `id → auth.users.id` | `email`, `registro_profesional` (UNIQUE) |
| `pacientes` | `id` (UUID) | `nutricionista_id → perfiles_nutricionistas` | `(nutricionista_id, rut)` UNIQUE parcial (WHERE rut IS NOT NULL, por migración SQL) |
| `consultas` | `id` (UUID) | `paciente_id → pacientes` | — (evento fechado) |
| `antropometria` | `id` (UUID) | `consulta_id → consultas` | `consulta_id` (1 medición por consulta en la práctica) |
| `alimentos` | `id` (UUID) | — | `(nombre, marca)` UNIQUE |
| `preparaciones` | `id` (UUID) | `nutricionista_id → perfiles_nutricionistas` (NULL = sistema) | — |
| `ingredientes_preparacion` | `id` (UUID) | `preparacion_id`, `alimento_id` | `(preparacion_id, alimento_id)` ★ |
| `pautas` (modelo `Pauta`) | `id` (UUID) | `consulta_id?`, `paciente_id`, `planificacion_id?`, `nutricionista_id` ★ | — |
| `detalle_pauta` | `id` (UUID) | `pauta_id`, `alimento_id` | `(pauta_id, alimento_id, momento_dia)` ★ |
| `Evaluacion` | `id` (UUID) | `paciente_id`, `nutricionista_id` ★ | — (evento fechado) |
| `planificaciones` (modelo `Planificacion`) | `id` (UUID) | `paciente_id`, `nutricionista_id` ★ | — |

★ = constraint agregada/formalizada por la migración `20260703000000_normalizacion_3fn_fks_uniques` (ver §5).

---

## 2. Verificación de Primera Forma Normal (1FN)

**Regla:** todos los atributos deben ser atómicos (sin listas ni estructuras anidadas) y cada fila única.

**Veredicto: NO se cumple estrictamente.** Violaciones formales:

| Tabla | Columna(s) | Tipo | Contenido |
|---|---|---|---|
| `pacientes` | `enfermedades`, `alergias`, `preferencias_alimentarias` | `text[]` | tags clínicos |
| `alimentos` | `restricciones` | `text[]` | tags de restricción (vegano, sin gluten…) |
| `pautas` | `tiempos_comida`, `estructura_grid_json` | `jsonb` | estructura de la pizarra/armador |
| `planificaciones` | `distribucion_macros` | `jsonb` | % CHO/proteínas/grasas |

**Justificación como desnormalización deliberada:**
- Los **arrays** son tags opacos: la aplicación nunca consulta "todos los pacientes con alergia X" con semántica relacional; solo lee/escribe la lista completa junto con la fila. PostgreSQL soporta arrays de forma nativa e indexable (GIN) si algún día se necesita.
- Los **JSON** de `pautas` almacenan la estructura libre de la pizarra (grid drag-and-drop): su forma cambia con la UI y no tiene esquema fijo; relacionalizarla obligaría a migrar el modelo con cada cambio de diseño del armador.
- `distribucion_macros` es un valor compuesto que siempre se lee/escribe como unidad.

**Alternativa 3FN estricta (documentada, no aplicada):** extraer a tablas hijas `paciente_alergia(paciente_id, alergia)`, `alimento_restriccion(alimento_id, restriccion)`, etc. Se descartó por costo/beneficio: agrega 4+ tablas y joins sin habilitar ninguna consulta que la aplicación necesite hoy.

---

## 3. Verificación de Segunda Forma Normal (2FN)

**Regla:** ningún atributo no-clave puede depender de *parte* de una clave compuesta.

**Veredicto: SÍ se cumple.** Todas las tablas usan PK surrogate de una sola columna (UUID), por lo que no pueden existir dependencias parciales.

**Matiz importante:** la 2FN se cumplía de forma *trivial* porque las claves candidatas naturales no estaban declaradas. Sin constraint, `detalle_pauta` permitía el mismo alimento dos veces en la misma pauta y momento, e `ingredientes_preparacion` el mismo ingrediente duplicado en una preparación. La migración de §5 declara esas claves candidatas como UNIQUE compuestos, haciendo el cumplimiento sustantivo y no solo formal.

---

## 4. Verificación de Tercera Forma Normal (3FN)

**Regla:** ningún atributo no-clave puede depender transitivamente de la clave (no-clave → no-clave).

**Veredicto: NO se cumple completamente.** Violaciones encontradas, con su evaluación:

### 4.1 `nutricionista_id` redundante en `pautas`, `Evaluacion` y `planificaciones`
Dependencia transitiva: `pauta → paciente → nutricionista`. El dueño de la pauta es derivable del paciente, por lo que almacenarlo de nuevo puede producir inconsistencia (pauta cuyo `nutricionista_id` no coincide con el del paciente).

**Justificación para mantenerlo:** las políticas RLS de Supabase filtran por `nutricionista_id = auth.uid()` directamente sobre cada tabla; sin la columna, cada policy y cada query necesitaría un join extra. Es el patrón estándar de multi-tenancy con RLS. **Mitigación aplicada:** ahora la columna tiene FK real hacia `perfiles_nutricionistas` (§5), de modo que al menos no puede apuntar a un nutricionista inexistente. Verificación en datos reales (2026-07-03): 0 filas inconsistentes entre `pauta.paciente_id` y `consulta.paciente_id`.

### 4.2 `pautas.paciente_id` junto a `consulta_id`/`planificacion_id`
Cuando la pauta tiene consulta o planificación, el paciente es derivable de ellas (transitiva). Pero ambas FKs son NULLables — existen pautas sueltas — así que `paciente_id` es necesario como dueño directo. Se acepta con la misma mitigación de integridad.

### 4.3 Atributos calculados en `Evaluacion`: `tmb`, `gasto_energetico_total`
Dependen funcionalmente de `peso_actual`, `talla_cm`, sexo/edad/actividad (no-clave → no-clave). **Se mantienen deliberadamente como snapshot clínico:** una evaluación es un registro histórico; si mañana `backend-math` cambia la fórmula de TMB (Harris-Benedict/Mifflin), las evaluaciones pasadas no deben recalcularse. Es el mismo criterio con que se congela un precio en una línea de factura.

### 4.4 `planificaciones.calorias_totales` junto a `distribucion_macros`
Dato potencialmente derivable (redundancia). Mismo criterio de snapshot: la planificación congela el objetivo calórico acordado con el paciente.

### 4.5 Menor: `alimentos.categoria` como texto libre
No es violación estricta de 3FN (no hay dependencia transitiva), pero un catálogo sin tabla lookup ya causó anomalías de actualización reales: las migraciones `recategorizar_alimentos_otros`, `mover_alimentos_a_ricos_en_grasas`, `unificar_verduras` existen precisamente para corregir categorías inconsistentes. **Mejora futura recomendada:** tabla `categorias_alimento` o un `CHECK`/enum.

---

## 5. Correcciones aplicadas (migración `20260703000000_normalizacion_3fn_fks_uniques`)

Verificación previa sobre datos reales (2026-07-03): **0 duplicados** en las claves candidatas y **0 huérfanos** en las columnas que reciben FK — la migración es segura.

1. **Claves candidatas declaradas:**
   - `detalle_pauta`: UNIQUE `(pauta_id, alimento_id, momento_dia)`. Nota: como `momento_dia` es NULLable, Postgres trata los NULL como distintos entre sí.
   - `ingredientes_preparacion`: UNIQUE `(preparacion_id, alimento_id)`.
2. **Integridad referencial:** FK `nutricionista_id → perfiles_nutricionistas(id)` con `ON DELETE CASCADE` en `pautas`, `Evaluacion` y `planificaciones` (antes eran columnas sin constraint: la DB aceptaba UUIDs inexistentes).
3. **Índices de apoyo** sobre `nutricionista_id` en las tres tablas (mismo patrón que `idx_pacientes_nutricionista`).

El `schema.prisma` ya refleja estos cambios (relaciones `nutricionista` + `@@unique` + `@@index`).

> **✅ Estado: APLICADA en la base de datos el 2026-07-03** (vía MCP de Supabase, registrada en el historial de migraciones del proyecto). Se verificó en `pg_constraint`/`pg_indexes` que las 3 FKs, los 2 UNIQUE compuestos y los 3 índices existen. El `schema.prisma` y la DB están sincronizados.

### Correcciones descartadas (y por qué)
- **Extraer arrays de `pacientes`/`alimentos` a tablas hijas** — 3FN estricta, pero invasivo (backend + frontend + seeds) sin consulta nueva que lo justifique. No recomendable antes del examen.
- **Eliminar `tmb`/`gasto_energetico_total`/`calorias_totales`** — son snapshots clínicos intencionales (§4.3–4.4).
- **Eliminar `nutricionista_id` redundante** — rompería el patrón RLS de Supabase (§4.1).

---

## 6. Conclusión

| Forma normal | ¿Se cumple? | Detalle |
|---|---|---|
| **1FN** | Parcial | Arrays/JSON como desnormalización deliberada y documentada (tags y estructuras de UI) |
| **2FN** | ✅ Sí | PKs surrogate; claves candidatas ahora declaradas con UNIQUE compuestos |
| **3FN** | Parcial | Redundancias justificadas: `nutricionista_id` (RLS multi-tenant) y atributos calculados (snapshot clínico) |

La base de datos está **normalizada hasta 3FN en su núcleo relacional** (pacientes–consultas–antropometría, alimentos–preparaciones–ingredientes, pautas–detalle). Las desviaciones restantes son **desnormalizaciones deliberadas**, cada una con justificación técnica (RLS, snapshot histórico, estructuras de UI flexibles) y con su riesgo de integridad mitigado por las FKs y UNIQUEs agregados en la migración `20260703000000`.
