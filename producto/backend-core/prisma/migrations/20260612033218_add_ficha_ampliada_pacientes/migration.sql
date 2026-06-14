-- Ficha ampliada del paciente: datos personales y sección "Salud y preferencias".
-- Las columnas de preferencias/alergias también serán usadas por el generador (Fase 5).
ALTER TABLE public.pacientes
  ADD COLUMN IF NOT EXISTS ocupacion text,
  ADD COLUMN IF NOT EXISTS rut text,
  ADD COLUMN IF NOT EXISTS direccion text,
  ADD COLUMN IF NOT EXISTS enfermedades text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS alergias text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferencias_alimentarias text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notas_preferencias text;

-- El RUT se valida y normaliza en backend-core (formato "12345678-9").
-- Unicidad por nutricionista, solo cuando hay RUT (no bloquea pacientes sin RUT).
CREATE UNIQUE INDEX IF NOT EXISTS pacientes_nutricionista_rut_unique
  ON public.pacientes (nutricionista_id, rut)
  WHERE rut IS NOT NULL;
