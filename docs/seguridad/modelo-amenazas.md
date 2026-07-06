# Modelo de Amenazas (STRIDE) — NutriFlow

Modelo de amenazas de alto nivel según STRIDE (`devsecops.md` §4), mapeado a los controles
ya implementados en las Fases 1–4 y a las brechas pendientes.

## Superficie de ataque

```
[Navegador] --HTTPS--> [Frontend Vercel] --Bearer JWT--> [backend-core Render] --HTTP--> [backend-math Render]
                                                              |                              |
                                                        [Supabase PG]                  [Supabase PG]
                                                        [Upstash Redis]
                                                        [Supabase Auth / JWKS]
```

**Puntos de entrada:** login (`/auth/login`), API REST autenticada de backend-core,
endpoints de cálculo de backend-math, OAuth Google + MFA TOTP (Supabase).
**Activos:** datos clínicos de pacientes (PII sensible), credenciales, tokens, secretos de plataforma.

## Análisis STRIDE por categoría

| Categoría | Amenaza | Control implementado | Pendiente |
| --- | --- | --- | --- |
| **S**poofing (suplantación) | Token falso / confusión de algoritmo | JWT **ES256 vía JWKS**, `algorithms:['ES256']`, `ignoreExpiration:false` (`jwt.strategy.ts`); MFA TOTP | Verificar claim `aud` |
| **T**ampering (manipulación) | Payload malicioso, inyección | `ValidationPipe` (whitelist/forbidNonWhitelisted), DTOs `class-validator`, Prisma ORM (sin SQL raw), Pydantic en backend-math | — |
| **R**epudiation (repudio) | Negar acciones / sin trazas | **Logging de auditoría de login** (email+IP, `auth.controller.ts`); logs de Vercel/Render/Supabase | Log estructurado en acciones sobre pacientes |
| **I**nformation disclosure | Fuga de secretos / datos / errores | `.env` gitignored + gitleaks; **helmet**; handler global que no filtra stack traces; token en memoria (no `localStorage`); CSP | Verificar **RLS** en Supabase |
| **D**enial of Service | Fuerza bruta / floods / payloads enormes | **Rate limiting** global (100/min) y estricto en login (5/min); **límite de payload 1 MB** en backend-math | Rate limiting en backend-math |
| **E**levation of privilege | Acceso a datos de otros / bypass de rol | Guards `JwtAuthGuard` en todos los controllers; `service_role` nunca en frontend | Autorización por rol/ownership a nivel de fila (RLS) |

## Riesgos residuales priorizados

1. **RLS de Supabase sin verificar** — la `anon key` es pública; sin RLS activo, un token
   válido podría leer datos de otros nutricionistas. **Acción:** auditar políticas RLS por tabla.
2. **backend-math sin autenticación propia** — confía en que solo backend-core lo llame
   (CORS + red). **Acción:** considerar un secreto compartido o red privada entre servicios.
3. **Autorización a nivel de recurso** — confirmar que cada query filtra por `nutricionista_id`
   del token, no solo que el usuario esté autenticado.

## Mantenimiento

Revisar este modelo ante cada cambio de arquitectura o nuevo punto de entrada, y al menos
trimestralmente. Complementa el escaneo automático (CodeQL/Trivy) con revisión manual de
los flujos de autenticación y autorización.
