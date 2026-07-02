# Verificación OWASP Top 10:2025 — NutriFlow

Auditoría de la aplicación completa (no solo el diff pendiente) contra las 10 categorías de
OWASP Top 10:2025. Metodología: 3 agentes de exploración en paralelo (A01, A05, A09/A10) +
revisión directa (A02, A03, A04, A06, A07, A08), con verificación cruzada de los hallazgos
más importantes antes de reportarlos.

## Resumen ejecutivo

| # | Categoría | Veredicto | Hallazgo principal |
| --- | --- | --- | --- |
| A01 | Broken Access Control | 🔴 **Vulnerable** | `CalculosController` sin guard de autenticación |
| A02 | Security Misconfiguration | 🟡 Aceptable con mejoras | CORS por regex de Vercel; resto sólido (helmet, CSP, Swagger) |
| A03 | Software Supply Chain Failures | 🟡 Aceptable con mejoras | 14 vulns npm en backend-core (multer/qs); frontend y Python limpios |
| A04 | Cryptographic Failures | 🟢 Bien | Sin crypto propia; JWT ES256 asimétrico; TLS de plataformas gestionadas |
| A05 | Injection | 🟢 Bien | 100% ORM parametrizado; solo log injection de baja severidad |
| A06 | Insecure Design | 🟡 Aceptable con mejoras | AAL de MFA no se aplica; backend-math sin auth propia (por diseño) |
| A07 | Authentication Failures | 🔴 **Vulnerable** | Posible bypass de MFA (aal no exigido) |
| A08 | Software/Data Integrity Failures | 🟡 Aceptable con mejoras | `pip install uv` sin pin en Dockerfile; resto bien (SHA pin en CI, npm ci) |
| A09 | Security Logging and Alerting Failures | 🟡 Aceptable con mejoras | Buen logging de login; sin logging de 403 ni alertas activas |
| A10 | Mishandling of Exceptional Conditions | 🟡 Aceptable con mejoras | Sin `ExceptionFilter` global; algunos `throw error` crudos |

**2 hallazgos críticos/altos requieren corrección antes de producción** (A01, A07). El resto
son mejoras de defensa en profundidad.

---

## Estado de remediación (ejecutado)

Correcciones aplicadas en el plan de remediación (build + tests verdes tras cada cambio):

| # | Acción | Estado |
| --- | --- | --- |
| A01 | `@UseGuards(JwtAuthGuard)` en `CalculosController` + `// TODO` de ownership en el mock `guardarMacronutrientes` | ✅ Corregido |
| A10 | Filtro global `AllExceptionsFilter` (`src/common/filters/`) + `useGlobalFilters` en `main.ts` | ✅ Corregido |
| A10 | try/catch en `math.engine.service.ts` (`obtenerTMB`/`obtenerCuadrador`) | ✅ Corregido |
| A08 | `pip install uv==0.11.26` (pin) en `backend-math/Dockerfile` | ✅ Corregido |
| A09 | `console.error`/`print()` → `Logger`/`logging` (evaluaciones, planificaciones, backend-math) | ✅ Corregido |
| A09 | Logging de acceso denegado por ownership (pacientes, evaluaciones, pautas, planificaciones) | ✅ Corregido |
| A05 | Helper `sanitizeForLog()` (CRLF) aplicado en logs con input de usuario (auth, alimentos) | ✅ Corregido |
| A07 | Aplicación server-side de `aal2` | ⏸️ No se toca — MFA/OAuth gestionados por Supabase (decisión del usuario); documentado como riesgo asumido |
| A03 | Vulns npm `multer`/`qs` | 📌 Diferido a Dependabot (fix es breaking); riesgo bajo (sin endpoints de upload) |
| A02 | CORS por regex de Vercel | 📌 Riesgo residual aceptado — auth por Bearer en memoria (no cookies) mitiga el impacto |
| A10 | Validación de rangos en `DatosPaciente` | ✅ Ya cubierta (`gt=0` en `schemas/calculos.py:6-8`) |

> Nota A07: si en el futuro se decide reforzar MFA a nivel de API, implementar un `AalGuard`
> que rechace tokens `aal1` para usuarios con factor MFA verificado, y validar el claim `aud`.

---

## A01 — Broken Access Control 🔴

### CRÍTICO: `CalculosController` sin autenticación
- **Archivo:** `producto/backend-core/src/calculos/calculos.controller.ts:8`
- **Verificado directamente:** de los 8 controllers de dominio, es el **único sin `@UseGuards(JwtAuthGuard)`**.
- `GET /dashboard-clinico/:pacienteId` y `POST /dashboard-clinico/macronutrientes` son accesibles sin token.
- **Matiz importante** (corrige el framing inicial del sub-agente): el endpoint GET no consulta la BD por `pacienteId` — los datos clínicos (peso/talla/edad/sexo) llegan como query params y se usan para calcular TMB; `pacienteId` solo se devuelve en la respuesta, no se usa para buscar el paciente. Es decir, **hoy no hay fuga directa de historiales clínicos almacenados**, pero sí:
  - Uso no autenticado del motor de cálculo (abuso de recursos).
  - `POST /macronutrientes` es un mock (no persiste aún), pero su DTO acepta `pacienteId` — el día que se conecte a persistencia real, se vuelve una escritura no autenticada arbitraria sobre cualquier paciente.
- **Impacto:** Alto — rompe el patrón de seguridad consistente del resto de la app y es un vector real de abuso hoy, y de IDOR de escritura mañana.
- **Fix:** añadir `@UseGuards(JwtAuthGuard)` a la clase y, cuando se persista `guardarMacronutrientes`, verificar ownership del paciente contra `nutricionista_id` del token (mismo patrón que `menus.service.ts`).

### Resto de módulos: correctos (verificado por el agente, con ejemplos revisados)
- `pacientes`, `pautas`, `evaluaciones`, `planificaciones`, `preparaciones`, `menus`: todos con guard + filtran por `nutricionista_id` en `findOne`/`update`/`remove`.
- `alimentos`: catálogo global sin ownership — correcto por diseño (compartido entre nutricionistas).
- `preparaciones`: distingue preparaciones del sistema (`nutricionista_id: null`, solo lectura) de propias, con `verificarPropiedad()` antes de mutar.
- `menus.service.ts` verifica que el paciente pertenezca al nutricionista **antes** de llamar a backend-math — patrón ejemplar a replicar en `calculos`.
- `backend-math` no tiene autenticación propia — aceptable porque no persiste ni expone datos de pacientes, y depende de que backend-core sea el único llamador (ver A06 sobre este supuesto).

---

## A02 — Security Misconfiguration 🟡

**Ya cubierto en Fases 1-2** (no se repite en detalle): helmet, CSP en `vercel.json`, `ValidationPipe` estricto, Swagger oculto en producción, `.env` correctamente gitignored.

### Hallazgo nuevo: patrón de CORS permite cualquier proyecto Vercel con prefijo "nutri-flow"
- **Archivo:** `producto/backend-core/src/main.ts:27,39`
- El regex `/^nutri-flow[a-z0-9-]*\.vercel\.app$/i` acepta **cualquier** deployment de Vercel cuyo subdominio empiece con "nutri-flow" — no solo los del proyecto legítimo. Vercel no reserva namespaces por defecto; un atacante podría crear un proyecto `nutri-flow-evil.vercel.app`.
- **Explotabilidad real: baja.** La app usa Bearer token en memoria (no cookies), así que `credentials: true` en CORS no habilita robo de sesión solo por esto — el atacante necesitaría además el token de la víctima (ej. vía XSS, que no se encontró). Es una debilidad de defensa en profundidad, no una vulnerabilidad explotable de forma aislada hoy.
- **Recomendación:** si Vercel lo permite, restringir por variable de entorno con el nombre exacto del proyecto en vez de un patrón abierto; o aceptar el riesgo residual documentándolo (bajo, dado el modelo de auth).

---

## A03 — Software Supply Chain Failures 🟡

**Verificado con `npm audit` / `pip-audit` reales (no solo inspección de config):**

| Servicio | Resultado |
| --- | --- |
| `backend-core` | **14 vulnerabilidades** (1 low, 6 moderate, 7 high) — `multer` (DoS por upload anidado/incompleto) y `qs` (DoS) |
| `nutriflow-frontend` | 0 vulnerabilidades |
| `backend-math` | 0 vulnerabilidades (pip-audit limpio) |

- **Matiz:** `multer` es dependencia transitiva de `@nestjs/platform-express`; no se encontró ningún uso de `FileInterceptor`/`@UploadedFile` en el código — **no hay endpoints de subida de archivos**, por lo que la superficie de explotación real de las DoS de multer es baja hoy. `qs` sí se usa (parsing de query strings) en cada request.
- El fix de `npm audit fix --force` implica downgrade breaking de `@nestjs/testing` — no aplicar a ciegas; requiere validar compatibilidad primero.
- **Ya cubierto en Fase 1:** Dependabot configurado (detectará y propondrá el fix), imágenes Docker pinneadas por digest, `requirements.txt` con versiones exactas.
- **Recomendación:** revisar el PR que generará Dependabot para `multer`/`qs`/`@nestjs/*` y probarlo en CI antes de mergear.

---

## A04 — Cryptographic Failures 🟢

- **Sin criptografía propia en el código:** no se encontró `Math.random()` para fines de seguridad, ni `md5`/`sha1` custom, ni claves hardcodeadas.
- **Contraseñas:** gestionadas por Supabase Auth (hashing/salting fuera del código de la app) — no hay superficie propia.
- **JWT:** firmado/verificado con **ES256 asimétrico vía JWKS** (`jwt.strategy.ts`), evita algorithm confusion; `ignoreExpiration: false`.
- **TLS:** delegado a las plataformas gestionadas (Vercel/Render/Supabase/Upstash), fuera del código de la app.
- **MFA (TOTP):** implementado enteramente sobre el SDK de Supabase (`producto/nutriflow-frontend/src/shared/hooks/useMfa.ts`) — sin criptografía custom, delega generación de secretos/QR/verificación TOTP a Supabase.
- Sin hallazgos.

---

## A05 — Injection 🟢

**Verificado exhaustivamente por el agente** (SQL, NoSQL, command, path traversal, template/XSS, log injection):

- **SQL:** 100% ORM parametrizado. El único `$queryRaw` (búsqueda de alimentos, `alimentos.service.ts:100`) usa `Prisma.sql` con template tags parametrizados, no interpolación de string — no explotable.
- **Command injection:** sin `eval`/`exec`/`subprocess`/`os.system` en ninguno de los 3 servicios.
- **Path traversal:** sin operaciones de archivo con input de usuario.
- **XSS/template injection (frontend):** sin `dangerouslySetInnerHTML`, sin `eval`, URLs armadas con `URLSearchParams` (auto-escapado).
- **Hallazgo menor — Log injection (CRLF) posible:** `auth.controller.ts:48` interpola `loginDto.email` directo en el mensaje de log; si el validador `@IsEmail()` de class-validator no rechazara un email con `\r\n` embebido (poco probable pero no verificado exhaustivamente), podría falsificar líneas de log. Severidad baja. Mismo patrón en `alimentos.service.ts` con `nombre`. **Recomendación:** loguear con logger estructurado (objeto, no string interpolado) para eliminar el vector por completo.

---

## A06 — Insecure Design 🟡

- **Rate limiting como control de diseño:** presente y bien pensado (global + estricto en login) — ✅.
- **Separación de responsabilidades:** backend-math delega toda la autorización a backend-core por diseño. Esto es razonable *si* backend-math nunca es accesible desde fuera de la red interna — pero no hay nada en el código que lo garantice técnicamente (sin secreto compartido, sin allowlist de IP); depende de la topología de red de Render. Si backend-math resultara accesible públicamente por su propia URL, sus endpoints de cálculo quedarían completamente abiertos (aunque sin acceso a datos de pacientes almacenados, según lo verificado en A01).
- **Diseño de MFA incompleto a nivel de aplicación:** ver A07 — el nivel de autenticación (`aal`) se lee pero no se usa como control de diseño en ningún guard, así que habilitar MFA en Supabase no necesariamente se traduce en "esta ruta requiere MFA completado".
- **Recomendación:** documentar explícitamente (o aplicar técnicamente) que backend-math no debe exponerse con URL pública sin restricción de red; diseñar un guard `Aal2Guard` para rutas sensibles si se quiere que MFA realmente eleve la seguridad de la sesión.

---

## A07 — Authentication Failures 🔴

### ALTO: el claim `aal` (nivel de aseguramiento de autenticación) se extrae pero nunca se aplica
- **Archivo:** `producto/backend-core/src/auth/jwt.strategy.ts:37` — `return { ..., aal: payload.aal }`.
- **Verificado:** ningún guard, decorator o controller de la app lee ni exige `aal === 'aal2'`.
- **Impacto:** Supabase permite MFA opcional por usuario (`useMfa.ts` en el frontend). Cuando un usuario tiene TOTP habilitado, Supabase distingue sesiones `aal1` (solo password) de `aal2` (password + segundo factor). Si el backend no exige `aal2` para usuarios con MFA activo, un atacante que solo tenga la contraseña (sin el segundo factor) podría, en ciertos flujos, obtener un token `aal1` válido y usarlo contra la API — **el MFA protegería el login en la UI pero no la API**, dependiendo de cómo Supabase emita el token en ese flujo.
- **Severidad:** Alta — el punto de la MFA es justamente evitar esto; sin la aplicación server-side, la protección es solo cosmética a nivel de UI.
- **Fix recomendado:** crear un guard (`AalGuard`) que, para usuarios con `verifiedFactor` en MFA (o de forma global si se decide exigirlo a todos), rechace tokens con `aal !== 'aal2'`. Verificar además el claim `aud` del JWT en `jwt.strategy.ts` (no se está comprobando actualmente, defensa en profundidad adicional).

### Resto de autenticación: sólido
- JWT ES256/JWKS con rotación de claves soportada, cacheado, rate-limited (10/min).
- Login: rate limit estricto (5/min) + logging de auditoría (email+IP, sin loguear secretos) — verificado.
- Password reset / signup / OAuth Google: manejados directamente por el SDK de Supabase desde el frontend (no hay endpoint propio vulnerable en backend-core para estos flujos).

---

## A08 — Software or Data Integrity Failures 🟡

**Ya cubierto en gran parte en Fase 1/3** (SHA pin de GitHub Actions, digest pin de imágenes Docker base, `npm ci` en vez de `npm install`, `package-lock.json`/`requirements.txt` versionados).

### Hallazgo nuevo: instalación sin pin en el Dockerfile de backend-math
- **Archivo:** `producto/backend-math/Dockerfile:11` — `RUN pip install uv`
- Instala la última versión de `uv` en cada build, sin pin de versión ni verificación de hash — inconsistente con el resto del pipeline (que sí pinea todo lo demás). Rompe la reproducibilidad del build y es, en teoría, un vector de supply-chain si el paquete `uv` en PyPI fuera comprometido entre builds.
- **Fix:** `RUN pip install uv==<version>` con versión fija (Dependabot, ya configurado, la mantendrá actualizada).

### Bien hecho
- CI usa `actions/checkout`, `setup-node`, `setup-python`, `codeql-action`, `trivy-action` todos **pinneados por SHA** (no tags móviles).
- `permissions: contents: read` por defecto en todos los workflows.
- Backup diario con **verificación de integridad** (`pg_restore --list`) añadida en Fase 4.

---

## A09 — Security Logging and Alerting Failures 🟡

**Verificado — confirmé directamente los `console.error`/`print()` reportados:**

- **Inconsistencia de logging:** `evaluaciones.service.ts:69` y `planificaciones.service.ts:56,90,120,136` usan `console.error()` en vez del `Logger` de Nest (que sí se usa correctamente en `auth.controller.ts`, `menus.service.ts`, `alimentos.service.ts`). Esto no es un log injection ni fuga de secretos, pero rompe la consistencia y dificulta centralizar/parsear logs en producción.
- **backend-math:** `main.py:67` y `api/alimentos.py:16,30,41` usan `print()` en vez de `logging` — se pierden en stdout sin niveles ni estructura.
- **No hay logging de autorización denegada (403/404 por ownership):** cuando `findOne` no encuentra un recurso porque pertenece a otro nutricionista, se lanza `NotFoundException` pero no se registra el intento — se pierde la señal para detectar reconocimiento/abuso (alguien probando IDs ajenos).
- **No hay alertas activas:** todo el logging es pasivo (solo texto a stdout, capturado por los logs de Render). No hay ningún mecanismo (webhook, email, Slack) que dispare ante ráfagas de login fallido, 403 o 429. Esto ya estaba identificado como pendiente en `docs/seguridad/monitoreo.md` (Fase 4) — sigue siendo la brecha más importante de esta categoría.
- **Lo positivo (confirmado):** el logging de login (Fase 4) es el único que además tiene contexto de seguridad correcto (IP + email + resultado, sin secretos); rate limiting configurado; sin secretos ni PII sensible filtrándose a logs en ningún punto revisado.

---

## A10 — Mishandling of Exceptional Conditions 🟡

**Verificado — confirmé directamente los 4 `throw error;` crudos:**

- **Sin `ExceptionFilter` global en NestJS:** confirmado, no existe ningún archivo `*.filter.ts` ni `useGlobalFilters()` en `main.ts`. Una excepción de Prisma no anticipada (fuera de los casos ya traducidos con `esErrorDeUnique`/`esErrorDeFk`) se propaga a Nest, que por defecto responde 500 con un mensaje razonablemente genérico (Nest no filtra el `message` de excepciones no-HTTP por defecto en producción salvo que se configure lo contrario) — **el riesgo de fuga de detalle interno es menor de lo que sugiere "sin filtro" a secas**, pero sigue siendo mejor práctica tener un filtro explícito que garantice el comportamiento y permita loguear con contexto antes de responder.
- **`throw error;` sin traducir** (confirmado): `preparaciones.service.ts:79,118` y `alimentos.service.ts:195,259` — capturan casos conocidos (FK/unique) pero re-lanzan cualquier otro error de Prisma tal cual.
- **`math.engine.service.ts:20-43`** (`obtenerTMB`, `obtenerCuadrador`): sin try/catch alrededor de la llamada HTTP a backend-math — confirmado por lectura directa mía. Contrasta con `menus.service.ts`, que sí envuelve la misma clase de llamada con try/catch + `InternalServerErrorException`. Si backend-math no responde (timeout/caído), el error de Axios se propaga sin traducir.
- **backend-math `api/calculos.py`:** sin validación explícita de rangos (peso/talla/edad > 0) antes de calcular — valores como `0` o negativos podrían causar una excepción no controlada capturada solo por el handler genérico (que sí responde de forma segura, pero es una condición evitable con validación Pydantic `gt=0`).

---

## Priorización de correcciones

| Prioridad | Hallazgo | Categoría |
| --- | --- | --- |
| 🔴 P0 | `@UseGuards(JwtAuthGuard)` en `CalculosController` | A01 |
| 🔴 P0 | Aplicar `aal2` server-side para sesiones MFA (nuevo `AalGuard`) | A07 |
| 🟠 P1 | Try/catch + traducción de errores en `math.engine.service.ts` | A10 |
| 🟠 P1 | `ExceptionFilter` global en NestJS | A10 |
| 🟠 P1 | Pin de versión en `RUN pip install uv` (Dockerfile backend-math) | A08 |
| 🟡 P2 | Unificar logging (`console.error`/`print` → `Logger`/`logging`) | A09 |
| 🟡 P2 | Logging de accesos denegados (403/404 por ownership) + alertas activas | A09 |
| 🟡 P2 | Revisar/aplicar fix de `npm audit` (multer/qs) validando compatibilidad | A03 |
| 🟢 P3 | Restringir CORS a nombre exacto de proyecto Vercel (no regex abierto) | A02 |
| 🟢 P3 | Logger estructurado para eliminar riesgo de log injection (email/nombre) | A05 |
| 🟢 P3 | Validación de rangos (`gt=0`) en `DatosPaciente` de backend-math | A10 |

## Nota metodológica

Esta auditoría es de **código estático** (no pentest dinámico). No cubre: configuración real
de RLS en la instancia de Supabase (pendiente de verificar en la propia consola — ver
`docs/seguridad/modelo-amenazas.md`), configuración de red de Render (si backend-math es
alcanzable públicamente), ni pruebas de fuzzing/DAST contra los endpoints desplegados.
