-- Elimina la policy de prueba que permitía a cualquier usuario autenticado
-- leer TODOS los pacientes (qual = true). El acceso legítimo queda cubierto por
-- la policy "Gestión de pacientes propios" (auth.uid() = nutricionista_id) y por
-- backend-core (Prisma, service role).
DROP POLICY IF EXISTS "Acceso de prueba a los pacientes" ON public.pacientes;
