// nutriflow-frontend/src/features/perfil/hooks/usePerfil.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../shared/utils/supabase';
import { perfilKeys } from '../../../shared/api/queryKeys';
import type { PerfilNutricionista, UpdatePerfilPayload } from '../types/perfil.types';

/**
 * Lee el perfil del nutricionista autenticado directamente desde Supabase.
 * La policy RLS de perfiles_nutricionistas (auth.uid() = id) garantiza
 * que solo se accede al perfil propio.
 */
export const usePerfilNutricionista = () => {
  return useQuery({
    queryKey: perfilKeys.all,
    queryFn: async (): Promise<PerfilNutricionista> => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('No hay sesión activa. Vuelve a iniciar sesión.');
      }

      const { data, error } = await supabase
        .from('perfiles_nutricionistas')
        .select('id, nombre, apellido, registro_profesional, email, fecha_creacion')
        .eq('id', userData.user.id)
        .single();

      if (error) {
        throw new Error(`No se pudo cargar el perfil: ${error.message}`);
      }
      return data as PerfilNutricionista;
    },
  });
};

/**
 * Actualiza el perfil en perfiles_nutricionistas y sincroniza
 * user_metadata (nombre/apellido) para que el Sidebar refleje el cambio.
 */
export const useUpdatePerfil = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdatePerfilPayload): Promise<void> => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('No hay sesión activa. Vuelve a iniciar sesión.');
      }

      const nombre = payload.nombre.trim();
      const apellido = payload.apellido.trim();
      const registroProfesional = payload.registro_profesional?.trim() || null;

      if (!nombre || !apellido) {
        throw new Error('El nombre y el apellido son obligatorios.');
      }

      const { error: perfilError } = await supabase
        .from('perfiles_nutricionistas')
        .update({
          nombre,
          apellido,
          registro_profesional: registroProfesional,
        })
        .eq('id', userData.user.id);

      if (perfilError) {
        throw new Error(`No se pudo guardar el perfil: ${perfilError.message}`);
      }

      // Sincronizamos user_metadata para que el Sidebar muestre el nombre actualizado.
      // onAuthStateChange (USER_UPDATED) refresca el store automáticamente.
      const { error: authError } = await supabase.auth.updateUser({
        data: { nombre, apellido },
      });

      if (authError) {
        throw new Error(
          `El perfil se guardó, pero no se pudo sincronizar la sesión: ${authError.message}`,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: perfilKeys.all });
    },
  });
};
