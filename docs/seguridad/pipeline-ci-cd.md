# Hardening del Pipeline CI/CD — NutriFlow

Resume los controles de seguridad del pipeline (roadmap `devsecops.md` §5) y lo que
hay que configurar en GitHub (lo que no puede vivir en archivos del repo).

## Workflows

| Workflow | Archivo | Qué hace | ¿Bloquea? |
| --- | --- | --- | --- |
| **CI** | `.github/workflows/ci.yml` | `build` + `test` de los 3 servicios (backend-core, frontend, backend-math) | ✅ build/test sí; lint informativo |
| **CodeQL (SAST)** | `.github/workflows/codeql.yml` | Análisis estático JS/TS + Python | Reporta en Security |
| **Trivy** | `.github/workflows/trivy.yml` | CVEs de dependencias, secretos y misconfig de Dockerfiles (SARIF) | Report-only (por ahora) |
| **gitleaks** | `.github/workflows/gitleaks.yml` | Escaneo de secretos en el historial | ✅ falla si detecta secretos |

### Notas de diseño
- **Lint no bloquea (aún):** hoy hay ~345 (backend-core) y ~237 (frontend) hallazgos de
  lint preexistentes, en su mayoría de formato (prettier). Se ejecuta con
  `continue-on-error` para dar visibilidad. Para convertirlo en gate hay que saldar esa
  deuda primero (`npm run lint -- --fix` por servicio y revisar los `no-unsafe-*`).
- **Trivy report-only:** publica en la pestaña Security sin romper el build. Cuando el
  backlog de CVEs esté limpio, subir `exit-code` a `"1"` con `severity: CRITICAL,HIGH`.
- **backend-core** ejecuta `npx prisma generate` antes del build (igual que el Dockerfile).

## Build hardening aplicado

- **Actions pinneadas por SHA** (no por tag móvil) en todos los workflows, con el tag en
  comentario. Dependabot (ecosistema `github-actions`, configurado en la Fase 1) mantiene
  esos SHA actualizados vía PR.
- **Permisos mínimos de `GITHUB_TOKEN`:** `contents: read` por defecto; solo CodeQL y
  Trivy elevan a `security-events: write` para publicar SARIF.
- **Reproducibilidad:** `npm ci` (no `npm install`) y dependencias Python pinneadas.

## A configurar en GitHub (ajustes del repo, no versionables)

1. **Branch protection** en `main` (Settings → Branches → Add rule):
   - Require a pull request before merging.
   - Require status checks to pass — marcar como *required*:
     `backend-core (NestJS)`, `frontend (React + Vite)`, `backend-math (FastAPI)`,
     `Analizar (javascript-typescript)`, `Analizar (python)`, `Detectar secretos`.
   - Require branches to be up to date before merging.
   - (Recomendado) Require signed commits.
2. **Code scanning:** Settings → Code security → habilitar *Code scanning* para ver los
   resultados de CodeQL y Trivy.
3. **Secret scanning + push protection:** habilitar el nativo de GitHub (complementa gitleaks).
