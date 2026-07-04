-- Normalización 3FN: claves candidatas naturales + FKs faltantes de nutricionista_id.
-- Verificado antes de aplicar (2026-07-03): sin duplicados en detalle_pauta /
-- ingredientes_preparacion y sin nutricionista_id huérfanos.

-- 1. Claves candidatas naturales (impiden filas duplicadas en tablas de detalle).
--    Nota: momento_dia es NULLable; Postgres trata los NULL como distintos, por lo
--    que dos filas con momento_dia NULL no chocan entre sí.
CREATE UNIQUE INDEX "detalle_pauta_pauta_id_alimento_id_momento_dia_key"
  ON public.detalle_pauta (pauta_id, alimento_id, momento_dia);

CREATE UNIQUE INDEX "ingredientes_preparacion_preparacion_id_alimento_id_key"
  ON public.ingredientes_preparacion (preparacion_id, alimento_id);

-- 2. Integridad referencial: nutricionista_id existía como columna sin FK en
--    pautas, "Evaluacion" y planificaciones. ON DELETE CASCADE consistente con
--    las FKs existentes hacia perfiles_nutricionistas (p. ej. pacientes).
ALTER TABLE public.pautas
  ADD CONSTRAINT pautas_nutricionista_id_fkey
  FOREIGN KEY (nutricionista_id) REFERENCES public.perfiles_nutricionistas (id)
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE public."Evaluacion"
  ADD CONSTRAINT "Evaluacion_nutricionista_id_fkey"
  FOREIGN KEY (nutricionista_id) REFERENCES public.perfiles_nutricionistas (id)
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE public.planificaciones
  ADD CONSTRAINT planificaciones_nutricionista_id_fkey
  FOREIGN KEY (nutricionista_id) REFERENCES public.perfiles_nutricionistas (id)
  ON DELETE CASCADE ON UPDATE NO ACTION;

-- 3. Índices de apoyo para las nuevas FKs (mismo patrón que idx_pacientes_nutricionista).
CREATE INDEX idx_pautas_nutricionista ON public.pautas (nutricionista_id);
CREATE INDEX idx_evaluacion_nutricionista ON public."Evaluacion" (nutricionista_id);
CREATE INDEX idx_planificaciones_nutricionista ON public.planificaciones (nutricionista_id);
