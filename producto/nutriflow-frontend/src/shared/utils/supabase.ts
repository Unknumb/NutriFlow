import { createClient } from '@supabase/supabase-js';
import { useAuthStore } from '../store/useAuthStore';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Inicializa el listener global de autenticación.
 * Debe llamarse UNA sola vez en main.tsx.
 * Sincroniza cada cambio de sesión (login, logout, refresh) con el store de Zustand.
 */
export function initAuthListener() {
  // 1. Cargamos la sesión existente al arrancar la app
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session);
  });

  // 2. Escuchamos cambios futuros (login, logout, token refresh)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      useAuthStore.getState().setSession(session);
    }
  );

  return subscription;
}