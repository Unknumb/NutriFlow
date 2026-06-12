# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

NutriFlow is a SaaS platform for managing nutrition consultations (Spanish-language codebase/UI). It is a containerized microservices app with three services under `producto/`:

- **`nutriflow-frontend`** — React 19 + Vite + TypeScript SPA
- **`backend-core`** — NestJS 11 (TypeScript) API, the main backend
- **`backend-math`** — FastAPI (Python) microservice for nutritional/metabolic calculations

Shared infra: PostgreSQL (via Supabase), Redis (Upstash) for caching, Supabase Auth for identity.

## Commands

### Run everything (Docker)
```bash
cd producto
docker-compose up --build
```
This builds `backend-math` (port 8000) and `backend-core` (port 3000) plus `redis-cache` (port 6379). The frontend is run separately (not in docker-compose).

### backend-core (NestJS)
```bash
cd producto/backend-core
npm install
npm run start:dev      # dev server with watch, port 3000
npm run build           # nest build
npm run lint            # eslint --fix
npm run test            # jest unit tests
npm run test:watch
npm run test:cov
npm run test:e2e        # uses test/jest-e2e.json
npx jest src/pacientes/pacientes.service.spec.ts   # run a single test file
```

Prisma / DB scripts (run from `producto/backend-core`):
```bash
npx prisma generate
npx prisma migrate dev
npm run seed:udd        # ts-node prisma/seed_udd.ts
npm run import:off      # ts-node prisma/import_off.ts (Open Food Facts import)
```

Requires `producto/backend-core/.env` (see `.env.example`): `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, plus Upstash Redis vars (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`).

### backend-math (FastAPI)
```bash
cd producto/backend-math
pip install -r requirements.txt
uvicorn main:app --reload   # port 8000
```

### nutriflow-frontend (React/Vite)
```bash
cd producto/nutriflow-frontend
npm install
npm run dev       # Vite dev server, port 5173
npm run build     # tsc -b && vite build
npm run lint
npm run preview
```
Requires `producto/nutriflow-frontend/.env` with `VITE_API_URL` (defaults to `http://localhost:3000`) and Supabase keys.

## Architecture

### Request flow / microservice boundary
- The **frontend** talks only to `backend-core` (NestJS, port 3000) via `apiClient` (`producto/nutriflow-frontend/src/shared/api/apiClient.ts`), an Axios instance that injects the Supabase access token as a Bearer header on every request and globally handles 401 (signs out + redirects to `/login`), 400, and 500 responses.
- **`backend-core`** is the orchestrator: it owns Postgres via Prisma, handles auth, and proxies math-heavy work to `backend-math` over HTTP (hardcoded base URL `http://127.0.0.1:8000/api/calculadoras` in `MathEngineService`). Some `backend-math` results (e.g. the macro "cuadrador") are cached in Redis (Upstash) by `backend-core` with a 24h TTL, keyed by a JSON-stringified request payload.
- **`backend-math`** is a stateless-ish FastAPI service exposing calculation endpoints under `/api/calculadoras` (TMB via Harris-Benedict/Mifflin averaging, macro "cuadrador", portion distribution, menu/recipe suggestions, "pizarra"/board logic). It has its own DB access (SQLAlchemy + psycopg2) for food/portion data.

### backend-core module layout (`producto/backend-core/src`)
Each domain is a self-contained Nest module (`*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`):
- `pacientes` — patients
- `pautas` — diet plans/guidelines (has `entities/`)
- `evaluaciones` — clinical evaluations/anthropometry
- `planificaciones` — planning
- `menus` — menu generation
- `calculos` — thin proxy module to `backend-math` via `MathEngineService` (in `calculos/`), which uses `RedisService` for caching
- `auth` — Supabase JWT validation (`JwtStrategy` extends Passport JWT, validates `SUPABASE_JWT_SECRET`, extracts `{ userId, email, role }` from the token `sub`/`email`/`role` claims); `JwtAuthGuard` and `@CurrentUser()` decorator are in `auth/guards` and `auth/decorators`
- `prisma` — global `PrismaService`/`PrismaModule` wrapping `@prisma/client`
- `redis` — `RedisService` wrapping `@upstash/redis` REST client

Auth: protect routes with the Nest `JwtAuthGuard` (Passport `jwt` strategy); user identity comes from Supabase-issued JWTs (`SUPABASE_JWT_SECRET`, HS256). There is no local password/login endpoint in `backend-core` — Supabase handles credential auth, `backend-core` only validates tokens.

### Database (Prisma schema, `producto/backend-core/prisma/schema.prisma`)
The schema is pulled from a Supabase Postgres instance, so it contains both:
- Supabase/auth-managed tables (`users`, `identities`, `sessions`, `mfa_*`, `sso_*`, `oauth_*`, etc.) — do not modify these directly; they're managed by Supabase Auth.
- App domain tables: `pacientes`, `antropometria`, `consultas`, `alimentos`, `preparaciones`, `ingredientes_preparacion`, `detalle_pauta`, `Pauta`, `Evaluacion`, `Planificacion`, `perfiles_nutricionistas`.

Maintenance scripts live in `producto/backend-core/prisma/`: `seed.ts` (default Prisma seed), `seed_udd.ts`, `import_off.ts` (Open Food Facts data import into `alimentos`), `cleanup_categories.ts`, `analyze_otros.ts`, `check_db.ts`.

### backend-math layout (`producto/backend-math`)
- `api/` — FastAPI routers: `alimentos`, `calculos`, `pautas`, `pizarra`, `menus` (mounted in `main.py` under `/api` or `/api/calculadoras`)
- `services/` — business logic: `calculadora_tmb.py`, `distribucion_service.py`, `armador_service.py` (pizarra/board), `menus_service.py`
- `schemas/` — Pydantic request/response models
- `models/` — SQLAlchemy models (`alimento.py`, `preparacion.py`, `base.py`)
- `core/` — `config.py` (settings via `pydantic-settings`), `db.py`, `valores_porciones.py`, `mock_recetas.py`
- CORS is restricted to `http://localhost:5173` and `http://localhost:3000` in `main.py`
- A global exception handler in `main.py` catches unhandled exceptions and returns a generic 500 JSON body (logs the real error server-side only)

### Frontend layout (`producto/nutriflow-frontend/src`)
Feature-folder structure:
- `app/` — root `App.tsx`, `main.tsx` entrypoint, layouts, global styles
- `pages/` — route-level page components (dashboard, pacientes, pautas, porciones, macronutrientes, generador, biblioteca, login)
- `features/<domain>/` — per-domain `components/`, `hooks/`, `services/` or `api/`, `types/`, `store/` (domains: pacientes, pautas, evaluaciones, planificaciones, menus, calculos, macronutrients, porciones, preparaciones, generador, diet-plan, login)
- `shared/` — `api/apiClient.ts` (Axios + Supabase auth interceptor + global error handling), `api/queryKeys.ts`, `store/` (Zustand: `useAuthStore`, `useClinicalStore`), `hooks/`, `ui/`, `utils/` (incl. Supabase client + `initAuthListener`)

State/data fetching: Zustand for client state, TanStack Query for server state/caching, TanStack Router for routing. Drag-and-drop (e.g. pizarra/pauta builder) uses `@dnd-kit`. PDF generation uses `@react-pdf/renderer`. Charts use `recharts`.

## CI

`.github/workflows/backup_diario.yml` runs a daily (03:00 UTC) `pg_dump` of the Supabase production DB and uploads it as a workflow artifact (7-day retention). Requires the `SUPABASE_DB_URL` repo secret.

## Team conventions

- Code, comments, and UI copy are primarily in Spanish — match this when adding new domain code.
- Each backend-core domain module follows the standard Nest generator layout (controller/service/module/dto), with `.spec.ts` files colocated next to the file they test.
