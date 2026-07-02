# Runbook de Respuesta a Incidentes — NutriFlow

Procedimiento operativo ante un incidente de seguridad (`devsecops.md` §6). Cubre el ciclo
de vida IR: preparación → detección → contención → erradicación → recuperación → lecciones.

## Roles

- **Coordinador del incidente:** lidera, decide y comunica (por defecto, el mantenedor del repo).
- **Técnico:** ejecuta contención y remediación.
- En un equipo pequeño una misma persona puede asumir ambos; lo importante es registrar todo.

## Clasificación de severidad

| Nivel | Ejemplo |
| --- | --- |
| 🔴 Crítico | Fuga de datos de pacientes, acceso no autorizado a la DB, secreto de producción expuesto |
| 🟠 Alto | Vulnerabilidad explotable en auth, DoS sostenido |
| 🟡 Medio | Vulnerabilidad de dependencia sin explotación activa |
| 🟢 Bajo | Misconfig sin impacto directo |

## Flujo de respuesta

### 1. Detección
Fuentes: alertas de GitHub (CodeQL/Trivy/Dependabot/secret scanning), logs de Render/Vercel/
Supabase, reporte externo (ver `SECURITY.md`), o anomalía en los logs de auditoría de login.

### 2. Contención (primeras acciones)
- **Credencial/secreto expuesto:** rotar de inmediato siguiendo
  [gestion-de-secretos.md](gestion-de-secretos.md) → *Runbook de rotación*.
- **Cuenta comprometida:** invalidar sesiones en Supabase (Auth → revoke), forzar reset y MFA.
- **Abuso/DoS:** revisar los logs de login (IP con muchos fallos); el rate limiting ya mitiga,
  bloquear la IP en el proveedor si persiste.
- **Servicio comprometido:** poner el servicio afectado en mantenimiento en Render/Vercel.

### 3. Erradicación
Corregir la causa raíz (parche de dependencia, fix de código, corrección de config).
Verificar que CodeQL/Trivy/CI pasan antes de desplegar.

### 4. Recuperación
Redeploy desde `main` limpio. Si hubo pérdida/corrupción de datos, restaurar el backup
(ver drill abajo). Monitorear de cerca tras el restablecimiento.

### 5. Post-mortem (RCA)
Documentar: cronología, causa raíz, impacto, cómo se detectó, qué falló, y acciones
correctivas con responsable y fecha. Sin culpas; foco en el sistema.

## Drill de restauración de backup (probar antes de necesitarlo)

El backup diario (`.github/workflows/backup_diario.yml`) verifica la integridad del dump en
cada corrida. Para un **ejercicio de recuperación completo** (recomendado: trimestral):

```bash
# 1. Descargar el último artefacto "nutriflow-database-backup" desde la pestaña Actions.
# 2. Levantar un Postgres desechable:
docker run --rm -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=restore_test -p 5433:5432 -d postgres:17
# 3. Restaurar (best-effort: se ignoran roles/extensiones específicos de Supabase):
pg_restore --no-owner --no-acl --clean --if-exists \
  -d "postgresql://postgres:postgres@localhost:5433/restore_test" nutriflow_prod_*.backup
# 4. Verificar datos de dominio:
psql "postgresql://postgres:postgres@localhost:5433/restore_test" \
  -c "SELECT count(*) FROM pacientes; SELECT count(*) FROM alimentos;"
```

Registrar el tiempo de restauración (RTO) y cualquier objeto que no restaure, para ir
afinando el procedimiento.
