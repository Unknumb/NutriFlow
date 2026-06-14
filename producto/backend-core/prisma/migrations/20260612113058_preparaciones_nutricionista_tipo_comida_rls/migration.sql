-- F2: preparaciones como fuente única.
-- nutricionista_id NULL = preparación del sistema (visible para todos los nutricionistas).
ALTER TABLE public.preparaciones
  ADD COLUMN nutricionista_id uuid NULL REFERENCES public.perfiles_nutricionistas(id) ON DELETE CASCADE,
  ADD COLUMN tipo_comida text NULL,
  ADD COLUMN imagen_url text NULL,
  ADD COLUMN fecha_creacion timestamptz DEFAULT now();

-- Vocabulario controlado de tiempos de comida (coincide con el frontend: Desayuno/Almuerzo/Cena/Colación).
ALTER TABLE public.preparaciones
  ADD CONSTRAINT preparaciones_tipo_comida_check
  CHECK (tipo_comida IS NULL OR tipo_comida IN ('desayuno', 'almuerzo', 'cena', 'colacion'));

CREATE INDEX idx_preparaciones_nutricionista ON public.preparaciones (nutricionista_id);

-- RLS de lectura como defensa en profundidad (el acceso real es vía backends, que bypassean RLS).
-- Propias + del sistema. Sin policies de escritura: toda escritura pasa por backend-core.
CREATE POLICY preparaciones_select_propias_o_sistema
  ON public.preparaciones FOR SELECT TO authenticated
  USING (nutricionista_id IS NULL OR nutricionista_id = auth.uid());

CREATE POLICY ingredientes_preparacion_select_via_preparacion
  ON public.ingredientes_preparacion FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.preparaciones p
      WHERE p.id = preparacion_id
        AND (p.nutricionista_id IS NULL OR p.nutricionista_id = auth.uid())
    )
  );
