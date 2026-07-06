# Gobernanza y Cumplimiento — NutriFlow

Mapeo ligero de los controles implementados (Fases 1–4) a los frameworks de referencia
(`devsecops.md` §7). No es una certificación; es una guía de trazabilidad control → evidencia.

## Mapeo de controles

| Control implementado | Evidencia (repo) | SOC 2 (TSC) | ISO 27001 (Anexo A) | NIST CSF |
| --- | --- | --- | --- | --- |
| Rate limiting + anti fuerza bruta | `app.module.ts`, `auth.controller.ts` | CC6.1 | A.8.20 | PR.AC |
| Validación de entrada + ORM | `main.ts` (ValidationPipe), DTOs, Prisma/Pydantic | CC7.1 | A.8.28 | PR.DS |
| Cabeceras de seguridad + CSP | `main.ts` (helmet), `vercel.json` | CC6.6 | A.8.26 | PR.PT |
| Autenticación fuerte (JWKS/ES256 + MFA) | `jwt.strategy.ts`, MFA TOTP | CC6.1 | A.8.5 | PR.AC |
| Gestión de secretos + escaneo | `.gitignore`, gitleaks, `env.validation.ts` | CC6.1 | A.8.24 | PR.DS |
| Least privilege / RLS | [gestion-de-secretos.md](gestion-de-secretos.md) | CC6.3 | A.8.3 | PR.AC |
| SAST / SCA / secret scanning en CI | CodeQL, Trivy, gitleaks, Dependabot | CC7.1 | A.8.8 | ID.RA / DE.CM |
| Pipeline endurecido (SHA pin, permisos mínimos) | `.github/workflows/*` | CC8.1 | A.8.32 | PR.IP |
| Logging y monitoreo | auditoría de login, [monitoreo.md](monitoreo.md) | CC7.2 | A.8.15 / A.8.16 | DE.CM |
| Respuesta a incidentes | [respuesta-incidentes.md](respuesta-incidentes.md), `SECURITY.md` | CC7.3 / CC7.4 | A.5.24–A.5.28 | RS |
| Backup y recuperación | `backup_diario.yml` (+ verificación integridad) | A1.2 | A.8.13 | PR.IP / RC |
| Modelo de amenazas | [modelo-amenazas.md](modelo-amenazas.md) | CC3.2 | A.8.25 | ID.RA |

## Brechas conocidas (backlog de gobernanza)

- Verificar y documentar las políticas **RLS** de Supabase por tabla.
- Convertir `lint` y Trivy en **gates bloqueantes** tras saldar la deuda existente
  (ver [pipeline-ci-cd.md](pipeline-ci-cd.md)).
- Integrar **error tracking (Sentry)** y uptime monitoring (ver [monitoreo.md](monitoreo.md)).
- Autenticación servicio-a-servicio entre backend-core y backend-math.
- Definir política formal de **retención de logs** y de datos (PII de pacientes).

## Cadencia de revisión

- **Trimestral:** modelo de amenazas, drill de restauración de backup, revisión de accesos.
- **Continuo:** alertas de CodeQL/Trivy/Dependabot; rotación de secretos cada 90 días.
- **Por cambio:** actualizar este mapeo cuando se añadan o modifiquen controles.
