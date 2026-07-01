import { createClient } from '@supabase/supabase-js';
import { useAuthStore } from '../store/useAuthStore';
import { useClinicalStore } from '../store/useClinicalStore';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Barrera de seguridad contra fuga de datos entre cuentas.
 * El estado clínico (paciente activo, planificación) se persiste en
 * localStorage, así que sobrevive al cambio de usuario. Sincronizamos el dueño
 * del estado con la sesión activa: si cambia el usuario, `switchOwner` descarta
 * el estado previo para que un nutricionista nunca vea el paciente activo de
 * otra cuenta. Si no hay sesión, no tocamos el estado (lo hace SIGNED_OUT).
 */
function syncClinicalOwner(userId: string | null) {
  if (userId) useClinicalStore.getState().switchOwner(userId);
}

/**
 * Inicializa el listener global de autenticación.
 * Debe llamarse UNA sola vez en main.tsx.
 * Sincroniza cada cambio de sesión (login, logout, refresh) con el store de Zustand.
 */
export function initAuthListener() {
  // 1. Cargamos la sesión existente al arrancar la app
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session);
    syncClinicalOwner(session?.user?.id ?? null);
  });

  // 2. Escuchamos cambios futuros (login, logout, token refresh)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      useAuthStore.getState().setSession(session);
      if (event === 'SIGNED_OUT') {
        // Al cerrar sesión, limpiar todo el estado clínico persistido.
        useClinicalStore.getState().reset();
      } else {
        syncClinicalOwner(session?.user?.id ?? null);
      }
    }
  );

  return subscription;
}