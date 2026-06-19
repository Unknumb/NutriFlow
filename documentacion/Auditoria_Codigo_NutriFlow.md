# Auditoría de Código y Ciberseguridad — Plataforma NutriFlow

**Rol del auditor:** Arquitecto de Software Cloud y Auditor de Ciberseguridad (DevSecOps)
**Fecha de emisión:** 16 de junio de 2026
**Alcance:** Microservicios `nutriflow-frontend` (React 19 + Vite), `backend-core` (NestJS 11) y `backend-math` (FastAPI / Python 3.11)
**Naturaleza de la intervención:** Revisión estática de solo lectura. **No se modificó ningún archivo de código fuente** para evitar conflictos con la rama de Frontend en desarrollo activo.
**Versión del documento:** 1.0

---

## 1. Resumen ejecutivo

La base de código de NutriFlow exhibe una **madurez de ingeniería notablemente superior a la habitual en un proyecto de este tamaño**. Los fundamentos de seguridad de datos están bien resueltos: todas las consultas a base de datos están parametrizadas (no existe superficie de inyección SQL), la autorización a nivel de objeto (*ownership scoping* por nutricionista) está aplicada de forma consistente, y la validación de entrada mediante `class-validator`/Pydantic es la norma. La arquitectura por capas y la separación de responsabilidades son limpias y predecibles.

Los hallazgos de mayor severidad **no son defectos de lógica, sino de configuración de borde (*edge hardening*)**: un controlador expuesto sin guard de autenticación, una política CORS permisiva en `backend-core`, la ausencia de *rate limiting* y *security headers*, y la gestión de secretos en texto plano. Todos ellos son corregibles con cambios acotados y de bajo riesgo de regresión.

### 1.1. Tablero de hallazgos por severidad

| Severidad | Cantidad | Naturaleza predominante |
|---|---|---|
| 🔴 Alta | 4 | Exposición de endpoint, CORS abierto, ausencia de auth en `backend-math`, gestión de secretos |
| 🟠 Media | 8 | Validación remota de token por request, Swagger en producción, sin *rate limiting*, sin Helmet, URL hardcodeada, RLS por verificar, `KEYS` en Redis, *hardening* de contenedores |
| 🟡 Baja | 7 | Tipado `any`, *logging* inconsistente, claves de caché por `JSON.stringify`, duplicación de vocabulario de dominio, componentes/archivos duplicados, *pool* de conexiones, *healthcheck* |

> **Veredicto general:** Arquitectura **apta para producción** una vez resueltos los 4 hallazgos de severidad alta. Ninguno compromete la integridad de los datos en el estado actual del repositorio, pero el endpoint sin guard y la política CORS deben atenderse antes de cualquier exposición pública.

---

## 2. Metodología y alcance

La auditoría se realizó mediante **análisis estático del código fuente** (SAST manual), inspección de archivos de configuración (`.env`, `Dockerfile`, `vite.config.ts`, `main.ts`/`main.py`) y trazado del flujo de autenticación y de datos extremo a extremo. Se verificó adicionalmente el historial de Git para descartar fugas de secretos versionados.

Se evaluaron los tres pilares solicitados:

1. **Seguridad** — autenticación (Supabase JWT), *guards*, exposición de endpoints, manejo de variables de entorno, inyección SQL y validación de entrada.
2. **Eficiencia y rendimiento** — patrones N+1 en Prisma, uso de Redis, bloqueo del *event loop* en FastAPI.
3. **Buenas prácticas y DRY** — duplicación de lógica, inyección de dependencias en NestJS y gestión de estado con Zustand.

**Fuera de alcance:** pruebas dinámicas (DAST), análisis de dependencias en tiempo de ejecución (no se ejecutó `npm audit` / `pip-audit`), pruebas de penetración activas y revisión de las políticas RLS en la consola de Supabase (ver recomendación §4.1.S4).

---

## 3. Hallazgo transversal prioritario: gestión de secretos

> **Severidad: 🔴 Alta** · **Pilar: Seguridad** · **Afecta a los 3 servicios**

### Evidencia

Los archivos `producto/backend-core/.env`, `producto/backend-math/.env` y `producto/nutriflow-frontend/.env` contienen **credenciales de producción reales en texto plano**:

- Contraseña de la base de datos Postgres (`DATABASE_URL` / `DIRECT_URL`).
- `SUPABASE_JWT_SECRET` (clave HS256 que firma y valida **todos** los tokens de sesión).
- `UPSTASH_REDIS_REST_TOKEN`.

### Análisis

**Lo que se hizo bien (mitigación existente):**

- Los tres `.env` están correctamente declarados en sus respectivos `.gitignore`. La verificación del historial de Git (`git log --all`) confirma que **ningún `.env` real fue commiteado jamás**; solo se versiona `backend-core/.env.example`. Esto evita la fuga más común y grave.

**Riesgo residual:**

- Los secretos viven en disco sin cifrar y se distribuyen manualmente entre desarrolladores. La filtración del `SUPABASE_JWT_SECRET` permitiría a un atacante **forjar tokens válidos para cualquier usuario** (HS256 es simétrico: quien posee el secreto firma sesiones arbitrarias).
- El `UPSTASH_REDIS_REST_TOKEN` aparece en el `.env` del **frontend**, donde no se utiliza (ver §4.3.S1). Es un residuo de configuración que amplía innecesariamente la superficie de exposición del secreto.

### Recomendaciones

1. **Migrar a un gestor de secretos** (Doppler, GCP Secret Manager, AWS Secrets Manager o las *project secrets* de la plataforma de despliegue). El `.env` debe quedar reservado solo para desarrollo local.
2. **Rotar todas las credenciales** que hayan sido compartidas por canales no seguros (chat, correo), en particular el `SUPABASE_JWT_SECRET` y la contraseña de Postgres.
3. Eliminar `UPSTASH_REDIS_REST_*` del `.env` del frontend.
4. Establecer una política de rotación periódica documentada.

---

## 4. Análisis por microservicio

### 4.1. `backend-core` — API NestJS 11 (orquestador)

Es el núcleo del sistema: posee Postgres vía Prisma, gestiona la autenticación y orquesta a `backend-math`. La calidad general de este servicio es **alta**.

#### Hallazgos positivos (qué se hizo bien)

| # | Hallazgo | Evidencia |
|---|---|---|
| ✅ P1 | **Cero superficie de inyección SQL.** El único `$queryRaw` del proyecto usa `Prisma.sql` con interpolación parametrizada (`${termino}`, `${categoria}`, `${limit}`) y `Prisma.join`, nunca concatenación de cadenas ni `$queryRawUnsafe`. | `alimentos/alimentos.service.ts:100-116` |
| ✅ P2 | **Autorización a nivel de objeto (anti-IDOR) consistente.** Todos los servicios filtran por `nutricionista_id` en la cláusula `WHERE` (`findFirst({ where: { id, nutricionista_id } })`), de modo que un nutricionista no puede leer ni mutar recursos de otro aunque adivine el UUID. | `pacientes.service.ts:87`, `pautas.service.ts:19,63,147`, `planificaciones.service.ts:63`, `menus.service.ts:38` |
| ✅ P3 | **Validación de entrada global y estricta.** `ValidationPipe` con `whitelist`, `forbidNonWhitelisted` y `transform` activos; los DTO usan `class-validator`. Esto descarta *mass assignment* y campos no declarados. | `main.ts:11-15` |
| ✅ P4 | **Transacciones atómicas** en escrituras multi-tabla (paciente + evaluación, activación de planificación). | `pacientes.service.ts:26,113`, `planificaciones.service.ts:31,71` |
| ✅ P5 | **JWT correctamente configurado:** `algorithms: ['HS256']` fijado (previene *algorithm confusion* / ataque `alg:none`) e `ignoreExpiration: false`. | `auth/jwt.strategy.ts:14-19` |
| ✅ P6 | **Inyección de dependencias idiomática:** `PrismaModule` y `RedisModule` marcados `@Global()`, inyección por constructor en todos los servicios. | `prisma/prisma.module.ts`, `redis/redis.module.ts` |

#### Seguridad — hallazgos a corregir

**🔴 S1 — Endpoint expuesto sin guard de autenticación.**
El controlador `CalculosController` (`@Controller('dashboard-clinico')`) **carece de `@UseGuards(JwtAuthGuard)`**, a diferencia de todos los demás controladores de dominio. Sus dos rutas quedan accesibles sin token:

```
GET  /dashboard-clinico/:pacienteId   → obtenerMetricas() (proxy a backend-math /tmb)
POST /dashboard-clinico/macronutrientes → guardarMacronutrientes()
```

*Referencia:* `calculos/calculos.controller.ts:7-11`. Confirmado por contraste: `pacientes`, `pautas`, `alimentos`, `evaluaciones`, `menus`, `preparaciones` y `planificaciones` sí declaran el guard.

> **Impacto:** un actor no autenticado puede invocar el motor de cálculo (riesgo de abuso de cómputo / DoS amplificado hacia `backend-math`) y obtener una respuesta que refleja el `pacienteId`. Aunque hoy el `POST` solo retorna un *mock* sin persistir (`math.engine.service.ts:50-57`), la ruta quedará peligrosa en cuanto se implemente la escritura real.
>
> **Recomendación:** anteponer `@UseGuards(JwtAuthGuard)` al controlador y propagar `@CurrentUser()`, homologándolo con el resto. Alternativamente, registrar `JwtAuthGuard` como *guard global* (`APP_GUARD`) y marcar como `@Public()` solo `/auth/login` — así "seguro por defecto" deja de depender de recordar el decorador en cada controlador.

**🔴 S2 — Política CORS permisiva.**
`main.ts:10` invoca `app.enableCors()` **sin configuración**, lo que habilita el origen comodín. `backend-math` sí restringe orígenes (`main.py:19-30`); `backend-core` no.

> **Recomendación:** restringir `origin` al dominio del frontend vía variable de entorno (`CORS_ORIGIN`), reflejando el patrón ya presente en `backend-math`.

**🟠 S3 — Documentación Swagger sin protección ni *gating* por entorno.**
`SwaggerModule.setup('api/docs', ...)` (`main.ts:25`) publica el esquema completo de la API sin autenticación y en todos los entornos.

> **Recomendación:** condicionar el montaje de Swagger a `NODE_ENV !== 'production'`, o protegerlo tras autenticación básica.

**🟠 S4 — Ausencia de *rate limiting* en autenticación.**
`POST /auth/login` (`auth/auth.controller.ts:9`) realiza `signInWithPassword` sin límite de intentos, exponiéndolo a *credential stuffing* / fuerza bruta.

> **Recomendación:** aplicar `@nestjs/throttler` (al menos sobre `/auth/login`). Como nota menor, el cliente Supabase se reinstancia en cada petición (`auth.controller.ts:18`); conviene crearlo una sola vez como *provider*.

**🟠 S5 — Sin cabeceras de seguridad HTTP (Helmet).**
No se observa `helmet()` ni configuración equivalente. Faltan `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, etc.

> **Recomendación:** incorporar `helmet` en el *bootstrap*.

**🟡 S6 — Validación de *audience*/*issuer* del JWT.**
`jwt.strategy.ts:22-28` valida la firma y la presencia de `sub`, pero no verifica `aud` (`authenticated`) ni `iss`. El riesgo es bajo (la `anon key`, que es un JWT firmado con el mismo secreto, se rechaza por no tener `sub`), pero validar `audience` es *defense-in-depth* recomendable.

#### Eficiencia y rendimiento

**Patrón N+1 (Prisma): no detectado.** ✅ El barrido de los servicios no encontró consultas dentro de bucles. Las relaciones se resuelven con `include` (p. ej. `planificaciones.service.ts:108-115` trae las pautas anidadas en una sola consulta) y los conteos paralelos usan `Promise.all` (`alimentos.service.ts:277`). Es un resultado limpio.

**Uso de Redis: bien planteado, con dos matices.** ✅ El patrón *cache-aside* con TTL e invalidación en escritura es correcto y está bien razonado (`pacientes.service.ts:60-77`, `menus.service.ts:59-67`, `math.engine.service.ts:32-44`).

- **🟠 E1 — `KEYS` bloqueante en invalidación.** `alimentos.service.ts:306` usa `redis.client.keys('menus:*')`. El comando `KEYS` es **O(N) y bloquea** el servidor Redis; en Upstash (REST) es además una operación costosa. **Recomendación:** sustituir por `SCAN` iterativo, o mantener un índice de claves (un `SET` con los *keys* de menús) para invalidación dirigida.
- **🟡 E2 — Claves de caché por `JSON.stringify(payload)`.** En `math.engine.service.ts:33` y `menus.service.ts:59` la clave depende del orden de serialización del objeto y de su cardinalidad. Dos *payloads* semánticamente iguales con distinto orden de propiedades generan *cache miss*. **Recomendación:** normalizar (ordenar claves) o usar un *hash* estable (p. ej. SHA-1 del *payload* canónico).

**🟠 E3 — Validación de token con *round-trip* remoto por petición.**
`JwtAuthGuard` (`auth/guards/jwt-auth.guard.ts:16`) **no usa la `JwtStrategy` local**; en su lugar hace `fetch` a `${SUPABASE_URL}/auth/v1/user` en **cada request protegido**. Esto añade latencia de red a todas las llamadas autenticadas, acopla la disponibilidad de la API a la de Supabase Auth y consume cuota de su *rate limit*.

> **Recomendación:** usar la validación **local** HS256 (la `JwtStrategy` ya implementada) como camino primario —valida firma y expiración sin red— y reservar la verificación remota solo para endpoints sensibles que requieran detectar revocación inmediata. Esto además resuelve la duplicidad descrita en §4.1.D1.

#### Buenas prácticas y DRY

- **🟡 D1 — Doble implementación de autenticación.** Coexisten `JwtStrategy` (Passport, validación local, **definida pero no usada por los controladores**) y `JwtAuthGuard` (validación remota *ad hoc*). Es lógica de autenticación duplicada y divergente. Unificar (ver E3).
- **🟠 D2 — URL de `backend-math` hardcodeada y repetida.** `http://127.0.0.1:8000/...` aparece literal en `math.engine.service.ts:10`, `menus.service.ts:63` (y `pautas.service.ts`). Además de violar DRY, **rompe en `docker-compose`**: desde el contenedor de `backend-core`, `127.0.0.1` no resuelve al contenedor de `backend-math` (debería ser el nombre de servicio, p. ej. `http://backend-math:8000`). **Recomendación:** centralizar en `ConfigService` (`MATH_ENGINE_URL`).
- **🟡 D3 — Manejo de errores y *logging* inconsistentes.** `menus.service.ts` envuelve la llamada HTTP en `try/catch`, pero `math.engine.service.ts:23` no lo hace (una caída de `backend-math` se propaga como 500 sin contexto). El *logging* alterna entre `Logger` de Nest (`alimentos`, `menus`) y `console.error` (`planificaciones.service.ts:56,90`). **Recomendación:** homologar con `Logger` y envolver toda llamada saliente con `try/catch` + *timeout*.
- **🟡 D4 — Tipado laxo (`any`).** Varios puntos usan `any` o `as any` (`pautas.service.ts:56` `dto: any`, `:98,184`; `planificaciones.service.ts:47`), lo que neutraliza las garantías de TypeScript. La validación de entrada sigue intacta (la realiza el `ValidationPipe` sobre el DTO del controlador), pero conviene tipar los *payloads* internos.
- **Nota de naming:** existen dos archivos `guardar-distribucion.dto.ts` (en `calculos/` y en `pautas/`) con **contenido distinto** (`GuardarDistribucionMacrosDto` vs `GuardarDistribucionDto`). No es duplicación de código, pero la colisión de nombres dificulta la navegación. Considerar renombrar.

---

### 4.2. `backend-math` — Microservicio de cálculo FastAPI

Servicio sin estado para TMB, "cuadrador" de macros, distribución de porciones y generación de menús. Estructura por capas (`api/` → `services/` → `schemas/` → `models/`) **clara y bien separada**.

#### Hallazgos positivos (qué se hizo bien)

| # | Hallazgo | Evidencia |
|---|---|---|
| ✅ P1 | **Los endpoints NO bloquean el *event loop*.** Todas las rutas se declaran con `def` síncrono (no `async def`). FastAPI ejecuta automáticamente las rutas síncronas en su *threadpool*, por lo que el trabajo de cálculo y las consultas SQLAlchemy (bloqueantes) **no detienen el bucle principal**. Es exactamente el patrón correcto para carga CPU-bound / I/O síncrona. | `api/calculos.py:11,31`, `api/menus.py:10`, `api/pautas.py:8`, `api/pizarra.py:7`, `api/alimentos.py:20` |
| ✅ P2 | **Sin inyección SQL.** El acceso a datos usa el ORM de SQLAlchemy (`db.query(Alimento).all()`), parametrizado por construcción; no hay SQL crudo ni *string formatting*. | `api/alimentos.py:33` |
| ✅ P3 | **Manejo global de excepciones que no filtra detalles internos.** El *handler* registra el error en servidor y devuelve un 500 genérico al cliente (sin *stack trace*). | `main.py:33-43` |
| ✅ P4 | **CORS restringido** a orígenes explícitos. | `main.py:19-30` |
| ✅ P5 | **Degradación elegante de Redis:** si Upstash no responde, el servicio sirve desde la base de datos sin caerse (`try/except` envolviendo `get`/`set`). | `api/alimentos.py:13-17,24-41` |
| ✅ P6 | **Configuración tipada** con `pydantic-settings` y caché de *settings* (`@lru_cache`). | `core/config.py` |
| ✅ P7 | **Lógica matemática pura y bien aislada** (funciones sin efectos secundarios, fácilmente testeable; existe `services/test_calculadora.py`). | `services/calculadora_tmb.py` |

#### Seguridad

**🔴 S1 — El servicio no tiene capa de autenticación.**
Ningún *router* exige token. El modelo de seguridad **depende por completo del aislamiento de red** (que `backend-math` solo sea alcanzable desde `backend-core`, no desde Internet). Si el puerto 8000 se expusiera públicamente, cualquiera podría consultar el catálogo de alimentos y abusar del motor de cálculo.

> **Recomendación:** documentar y **forzar** explícitamente esta frontera de confianza: no publicar el puerto 8000 en el *host* (en `docker-compose`, exponerlo solo en la red interna), y/o exigir un secreto compartido de servicio-a-servicio (cabecera `X-Internal-Token`) validado por *middleware*. La defensa en profundidad es preferible a confiar únicamente en la topología de red.

#### Eficiencia y rendimiento

- **✅** No hay patrones bloqueantes ni librerías pesadas (no se importan `numpy`/`pandas`); el cálculo es Python puro de costo trivial.
- **🟡 E1 — *Pool* de conexiones sin afinar.** `core/db.py:10` crea el *engine* con `create_engine(DATABASE_URL)` sin `pool_pre_ping=True` ni dimensionamiento. Contra el *pooler* de Supabase, `pool_pre_ping` evita errores por conexiones obsoletas. **Recomendación:** añadir `pool_pre_ping=True` y revisar `pool_size`/`max_overflow`.
- **Nota:** considerar que el *threadpool* por defecto de Starlette/anyio tiene un tope (≈40 hilos). Para la escala actual es holgado; tenerlo presente si crece la concurrencia de cálculos.

#### Buenas prácticas y DRY

- **🟡 D1 — Doble mecanismo de configuración de DB.** `core/config.py` lee `DATABASE_URL` vía `pydantic-settings`, pero `core/db.py:9` la vuelve a leer con `os.getenv` + `load_dotenv`, ignorando `Settings`. Además, el *default* difiere: `config.py` cae a SQLite mientras que `db.py` pasaría `None` a `create_engine` (fallo en arranque) si faltara la variable. **Recomendación:** usar `settings.DATABASE_URL` como fuente única.
- **🟡 D2 — *Logging* con `print()`.** `main.py:36` y `api/alimentos.py` usan `print` en lugar del módulo `logging`, lo que dificulta el control de niveles y el envío a un *sink* centralizado en producción. **Recomendación:** migrar a `logging`.

---

### 4.3. `nutriflow-frontend` — SPA React 19 + Vite

Estructura *feature-folder* ordenada; estado de servidor con TanStack Query y estado de cliente con Zustand. Calidad **alta**.

#### Hallazgos positivos (qué se hizo bien)

| # | Hallazgo | Evidencia |
|---|---|---|
| ✅ P1 | **No se filtran claves privadas al *bundle*.** Solo se consumen variables con prefijo `VITE_` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_URL`). Se verificó que `UPSTASH_*`, `JWT_SECRET`, `service_role` y `DATABASE_URL` **no se referencian en `src/`**, por lo que Vite no los empaqueta. La clave Supabase expuesta es la *publishable/anon key*, diseñada para ser pública. | `shared/utils/supabase.ts:4-5`, `shared/api/apiClient.ts:6` |
| ✅ P2 | **Cliente HTTP centralizado y robusto:** interceptor que inyecta el *Bearer* desde `supabase.auth.getSession()` (con *refresh* automático), *timeout* de 10s y manejo global del 401 (cierre de sesión + redirección). | `shared/api/apiClient.ts` |
| ✅ P3 | **Gestión de estado de autenticación con una única fuente de verdad:** `onAuthStateChange` de Supabase sincroniza la sesión hacia el `useAuthStore` de Zustand; el *store* es minimalista y deriva `isAuthenticated` de la sesión. | `shared/utils/supabase.ts:14-28`, `shared/store/useAuthStore.ts` |

#### Seguridad

- **🟠 S1 — `UPSTASH_REDIS_REST_TOKEN` presente en el `.env` del frontend.** Aunque **no se empaqueta** (no lleva prefijo `VITE_` ni se usa en `src/`), su sola presencia es un riesgo de higiene: basta que alguien lo prefije con `VITE_` o que un *build* lo arrastre para filtrarlo. **Recomendación:** eliminarlo (ver §3). Severidad media por el potencial, no por una fuga activa.
- **🟡 S2 — Almacenamiento del token en `localStorage`.** Supabase persiste la sesión en `localStorage` por defecto, lo que la hace susceptible a robo vía XSS. Es el *trade-off* estándar de la industria; se menciona como *defense-in-depth*. **Recomendación:** mantener una CSP estricta (vía Helmet en el *backend* / `nginx.conf`) y sanitizar todo *render* de contenido del usuario para minimizar la superficie XSS.

#### Buenas prácticas y DRY

- **🟡 D1 — Componentes/archivos duplicados.** Existen dos `DashboardLayout.tsx` (`app/layouts/` y `shared/ui/organisms/`) y dos `PatientInfoCard.tsx` (`features/calculos/` y `features/pacientes/`). Es probable que uno de cada par sea código muerto o una bifurcación que debería consolidarse. **Recomendación:** verificar cuál se usa realmente y unificar en `shared/ui/`.
- **✅ Zustand bien usado:** *stores* pequeños y enfocados (`useAuthStore`, `useClinicalStore` con `persist`), sin lógica de servidor mezclada (esa vive en TanStack Query). Es una separación correcta entre estado de cliente y estado de servidor.

---

## 5. Hallazgos transversales (DRY entre microservicios)

> **Severidad: 🟡 Baja-Media** · **Pilar: DRY** · **La pregunta explícita del *brief*: "¿reescribimos la misma lógica en múltiples servicios?"**

**Sí, en un punto concreto y de forma deliberada:** el **vocabulario controlado de restricciones dietéticas** está **triplicado** en tres lenguajes/repositorios:

- `backend-math/core/restricciones.py` (fuente de la lógica de filtrado).
- `backend-core/src/menus/restricciones.constants.ts`.
- `nutriflow-frontend/src/features/generador/constants/restricciones.ts`.

**Atenuante (qué se hizo bien):** la duplicación es **consciente y está gobernada**. Cada archivo encabeza con un comentario `MANTENER SINCRONIZADO con...` y documenta la convención semántica. Para constantes que cruzan la frontera Python/TypeScript, la duplicación es un mal genuinamente difícil de evitar (no hay *runtime* compartido).

**Riesgo:** la sincronización es manual; una restricción añadida en un solo lado produce *bugs* silenciosos (un alimento incompatible que no se excluye, o una opción que aparece en la UI pero el *backend* ignora). El mismo patrón aplica a las categorías de alimentos (`CATEGORIAS_CANONICAS` en `alimentos.service.ts:38` "deben calzar con `MAPEO_CATEGORIAS` de backend-math") y a la clave de caché compartida `alimentos:catalogo_completo`, *string* mágico repetido en `backend-core` y `backend-math`.

**Recomendaciones (en orden de esfuerzo):**

1. **Fuente única de verdad generada:** definir el vocabulario una vez (p. ej. un `restricciones.json` versionado en la raíz) y **generar** los artefactos `.py`/`.ts` en *build time*. Elimina la deriva sin acoplar *runtimes*.
2. **Alternativa de menor esfuerzo:** un *test* de contrato en CI que falle si las tres listas divergen (comparación de conjuntos).
3. Para la categoría/clave de caché, exponerlas como constantes compartidas o validarlas con un *test* de integración.

---

## 6. Plan de remediación priorizado

| Prioridad | ID | Hallazgo | Servicio | Esfuerzo |
|---|---|---|---|---|
| **P0 — Inmediato** | S1 | Proteger `/dashboard-clinico` con `JwtAuthGuard` (o `APP_GUARD` global + `@Public`) | backend-core | Bajo |
| **P0** | S2 | Restringir CORS al dominio del frontend | backend-core | Bajo |
| **P0** | §3 | Rotar secretos y migrar a gestor de secretos | Todos | Medio |
| **P0** | S1 | Cerrar/aislar el puerto de `backend-math` o exigir token interno | backend-math / infra | Bajo |
| **P1 — Corto plazo** | E3/D1 | Validación de JWT local (eliminar *fetch* por request) | backend-core | Medio |
| **P1** | S4 | *Rate limiting* en `/auth/login` (`@nestjs/throttler`) | backend-core | Bajo |
| **P1** | S5 | Añadir `helmet` (+ CSP) | backend-core | Bajo |
| **P1** | S3 | Condicionar Swagger a entorno no productivo | backend-core | Bajo |
| **P1** | D2 | Externalizar `MATH_ENGINE_URL` (corrige *bug* de Docker) | backend-core | Bajo |
| **P2 — Mejora continua** | E1 | Reemplazar `KEYS` por `SCAN`/índice en invalidación Redis | backend-core | Medio |
| **P2** | D-trans | Fuente única para el vocabulario de restricciones | Todos | Medio |
| **P2** | E1 | `pool_pre_ping=True` en SQLAlchemy | backend-math | Bajo |
| **P2** | *Varios* | *Hardening* de contenedores (ver §7) | backend-core / backend-math | Bajo |
| **P3 — Higiene** | D3/D4/D2 | Homologar *logging*/manejo de errores, reducir `any`, unificar config DB | backend-core / backend-math | Bajo |
| **P3** | D1 | Consolidar componentes duplicados | frontend | Bajo |

---

## 7. Anexo — Observaciones de *hardening* de contenedores (DevSecOps)

Revisión de los `Dockerfile` (no bloqueante, pero recomendable antes de producción):

- **`backend-core/Dockerfile`:** usa `npm install` (no reproducible) en lugar de `npm ci`; es de **una sola etapa**, por lo que la imagen final arrastra `devDependencies`, código fuente y *toolchain* de *build*; **corre como `root`** (sin `USER node`). *Recomendación:* *build* multi-etapa + `npm ci` + usuario no privilegiado.
- **`backend-math/Dockerfile`:** instala `gcc` pero **no lo elimina** del *layer* final (la imagen conserva el compilador); **corre como `root`**. *Recomendación:* multi-etapa (compilar en una etapa, copiar solo *wheels*/artefactos a una imagen *slim*) y `USER` no-root.
- **`nutriflow-frontend/Dockerfile`:** ✅ ejemplar — *build* multi-etapa, `npm ci`, y servido por `nginx` sobre artefactos estáticos. Es el patrón a replicar en los otros dos.

**Observación operativa adicional:** `AppController` (`app.controller.ts`) está vacío; no existe un *endpoint* de *health check* (`/health`). *Recomendación:* exponer un *liveness/readiness probe* para orquestadores.

---

## 8. Conclusión

NutriFlow es un proyecto con **decisiones de ingeniería sólidas y conscientes**: la protección contra inyección SQL e IDOR —los riesgos más graves y frecuentes en aplicaciones de datos— está **bien resuelta de raíz**, la validación de entrada es estricta, el uso de Redis y las transacciones es maduro, y el patrón de rutas síncronas en FastAPI demuestra comprensión real del modelo de concurrencia. La duplicación de lógica, donde existe, es deliberada y está documentada.

Los riesgos pendientes son de **endurecimiento de configuración**, no de diseño: un guard faltante, una política CORS, *headers* de seguridad y la profesionalización de la gestión de secretos. Son correcciones acotadas, de bajo riesgo de regresión, y una vez aplicadas (especialmente los cuatro ítems P0) la plataforma queda en condiciones adecuadas para un despliegue productivo.

---

*Documento generado en modo de solo lectura. No se modificó ningún archivo de código fuente del proyecto. Las referencias `archivo:línea` corresponden al estado del repositorio al 16 de junio de 2026.*
