# Política de Seguridad — NutriFlow

## Versiones soportadas

Se aplican parches de seguridad únicamente a la rama `main` (producción). No se
mantienen versiones antiguas.

## Reporte de vulnerabilidades

Si encuentras una vulnerabilidad, **no abras un issue público**. Repórtala de forma
privada:

- **GitHub Security Advisories:** pestaña *Security → Report a vulnerability* del
  repositorio (canal preferido).
- **Correo:** benjagonzalez230@gmail.com con el asunto `[SECURITY] NutriFlow`.

Incluye, si puedes: descripción, pasos de reproducción, impacto estimado y versión/commit
afectado. **No** incluyas datos de pacientes reales ni secretos en el reporte.

## Compromisos de respuesta

| Etapa | Objetivo |
| --- | --- |
| Acuse de recibo | ≤ 72 h |
| Evaluación inicial y severidad | ≤ 7 días |
| Corrección (crítica/alta) | Lo antes posible; mitigación temporal si aplica |
| Divulgación coordinada | Tras publicar el fix, de común acuerdo con quien reporta |

## Alcance

En alcance: los tres servicios bajo `producto/` (frontend, backend-core, backend-math) y
sus workflows de CI/CD. Fuera de alcance: las plataformas gestionadas subyacentes (Vercel,
Render, Supabase, Upstash), que tienen sus propios canales de reporte.

## Buenas prácticas para colaboradores

- Nunca commitear secretos (gitleaks corre en CI y en pre-commit; ver
  [docs/seguridad/gestion-de-secretos.md](docs/seguridad/gestion-de-secretos.md)).
- Ejecutar `pre-commit install` tras clonar el repo.
- Toda dependencia nueva pasa por Dependabot y los escaneos de CodeQL/Trivy.
