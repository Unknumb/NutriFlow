# Gestión Segura de Secretos — NutriFlow

Guía operativa para manejar secretos en la arquitectura de plataformas gestionadas
(Vercel, Render, Supabase, Upstash). Complementa el roadmap de `devsecops.md` (§2, §5).

## Principios

1. **Ningún secreto en el repositorio.** Los `.env` reales están cubiertos por los
   `.gitignore` de cada servicio; solo se versionan los `.env.example` (plantillas).
   El escaneo de secretos (gitleaks) previene fugas futuras — ver más abajo.
2. **Least privilege.** Cada credencial con el mínimo alcance necesario; la clave
   `service_role` de Supabase **nunca** llega al frontend.
3. **Fail-fast.** El backend valida la presencia de todos los secretos al arrancar
   (`producto/backend-core/src/config/env.validation.ts`); si falta uno, no levanta.
4. **Rotación periódica** y ante cualquier sospecha de exposición.

## Inventario de secretos y dónde viven

| Secreto | Usado por | Store en producción | Sensibilidad |
| --- | --- | --- | --- |
| `DATABASE_URL` / `DIRECT_URL` | backend-core, backend-math | Render → Environment (origen: Supabase → Database → Connection string) | 🔴 Alta (password DB) |
| `SUPABASE_URL` | backend-core, frontend (`VITE_SUPABASE_URL`) | Render + Vercel | 🟢 Pública (URL) |
| `SUPABASE_ANON_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY` | backend-core, frontend | Render + Vercel | 🟡 Semi-pública (protegida por RLS) |
| `SUPABASE_JWT_SECRET` | backend-core (legado) | Render | 🔴 Alta — ver nota |
| Supabase `service_role` key | (aún no usado) | **Solo backend** si hiciera falta; jamás en Vercel/frontend | 🔴 Crítica |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | backend-core, backend-math | Render → Environment (origen: Upstash console) | 🔴 Alta (token) |
| `MATH_ENGINE_URL` | backend-core | Render | 🟢 Baja (URL interna) |
| `FRONTEND_URL` / `ALLOWED_ORIGINS` | backends (CORS) | Render | 🟢 Baja |

> **Nota sobre `SUPABASE_JWT_SECRET`:** la validación de tokens usa **JWKS + ES256**
> (`src/auth/jwt.strategy.ts`), que no necesita el secreto HS256. Si ninguna otra parte
> lo consume, es candidato a **eliminarse** para reducir superficie de exposición.

## Least privilege por plataforma

- **Supabase:** distinguir `anon` (pública, siempre acompañada de **Row Level Security**
  activo en las tablas) de `service_role` (bypassa RLS → crítica, solo servidor).
  Verificar que RLS está habilitado en todas las tablas de dominio.
- **Upstash:** usar tokens con el menor alcance posible; si se necesita solo lectura en
  algún consumidor, emitir un token de solo-lectura en vez del token completo.
- **Vercel:** solo variables con prefijo `VITE_` y siempre públicas (se empaquetan en el
  bundle del navegador). Nunca poner ahí JWT secret, tokens de Redis ni `service_role`.
- **Render:** usar *Environment Groups* para compartir variables comunes entre servicios
  sin duplicarlas, y separar valores por entorno (production vs preview).

## Escaneo de secretos (prevención de fugas)

- **CI:** `.github/workflows/gitleaks.yml` escanea el historial de git en cada push/PR.
- **Local:** `.pre-commit-config.yaml` corre gitleaks antes de cada commit. Activar con:
  ```bash
  pip install pre-commit
  pre-commit install
  ```
- **Config:** `.gitleaks.toml` (allowlist para los placeholders de `.env.example`).

## Runbook de rotación

Rotación recomendada: cada 90 días para credenciales 🔴, e **inmediata** ante sospecha de
exposición. Procedimiento general (sin downtime, salvo el password de DB):

### Password de base de datos (Supabase)
1. Supabase → **Project Settings → Database → Reset database password**.
2. Copiar las nuevas `Connection string` (pooler 6543 y directa 5432).
3. Actualizar `DATABASE_URL` y `DIRECT_URL` en Render (backend-core y backend-math).
4. Redeploy de ambos backends. Verificar `/health`.

### Token de Upstash Redis
1. Upstash console → base de datos → **rotar/regenerar** el REST token.
2. Actualizar `UPSTASH_REDIS_REST_TOKEN` en Render.
3. Redeploy. Verificar que la caché responde (endpoints que usan Redis).

### Claves de Supabase (anon / service_role)
1. Supabase → **API keys → Roll** la clave correspondiente.
2. Actualizar en **todos** los stores que la usan: Render (`SUPABASE_ANON_KEY`) y
   Vercel (`VITE_SUPABASE_PUBLISHABLE_KEY`) para la anon.
3. Redeploy backend y frontend.

### Ante fuga confirmada
1. Rotar **de inmediato** el/los secretos afectados (pasos anteriores).
2. Revisar logs de Supabase/Render/Upstash por accesos anómalos.
3. Si el secreto llegó al historial de git: rotar (la rotación invalida el valor filtrado)
   y, si procede, reescribir historial. La rotación es la mitigación principal.
