# Monitoreo y Observabilidad — NutriFlow

Estrategia de monitoreo de seguridad sobre plataformas gestionadas (`devsecops.md` §6).

## Capas de logs (ya disponibles)

| Fuente | Qué observar |
| --- | --- |
| **Render** (backend-core, backend-math) | Logs de aplicación, incl. **auditoría de login** (email+IP, éxito/fallo) emitida por `auth.controller.ts` |
| **Vercel** (frontend) | Logs de build y de funciones edge, errores del cliente |
| **Supabase** | Logs de Auth (logins, MFA, OAuth), Postgres logs, uso de la API |
| **Upstash** | Métricas de comandos Redis, latencia |
| **GitHub** | Alertas de CodeQL, Trivy, Dependabot y secret scanning (pestaña Security) |

## Señales de seguridad a vigilar

- Ráfagas de `Login fallido ... desde IP X` (fuerza bruta) → el rate limiting ya devuelve 429;
  investigar si una IP los acumula.
- Picos de respuestas `413` en backend-math (intentos de payloads grandes).
- Errores 500 recurrentes (posible explotación o bug).
- Nuevas alertas CRITICAL/HIGH de Trivy/CodeQL.

## Recomendado (siguiente paso, no implementado en código)

- **Error tracking (Sentry):** integrar el SDK en frontend y backend-core para agregación de
  errores y alertas. Requiere crear el proyecto y añadir el DSN como secreto en Vercel/Render.
  Al hacerlo, añadir `SENTRY_DSN` como variable **opcional** en `env.validation.ts`.
- **Uptime monitoring:** un check externo (p. ej. UptimeRobot/BetterStack) contra el `/health`
  de backend-core y la home del frontend, con alerta por caída.
- **Alertas de plataforma:** activar notificaciones de Render (deploy/health) y de Supabase
  (uso/errores) hacia un canal del equipo.

## Retención y privacidad

- Los logs de auditoría **no** contienen contraseñas ni tokens (solo email + IP + resultado).
- Definir retención acorde a la sensibilidad (datos de pacientes = PII): revisar la política
  de retención de logs de cada plataforma y minimizar la exposición de PII en logs.
