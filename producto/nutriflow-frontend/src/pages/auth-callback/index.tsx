import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../shared/utils/supabase';
import { useRouter } from '@tanstack/react-router';

/**
 * Página de retorno del flujo OAuth (Google).
 * Supabase redirige aquí con un `code` en la URL; supabase-js lo intercambia
 * automáticamente por una sesión (flujo PKCE) y emite el evento SIGNED_IN.
 *
 * Navegamos al dashboard en cuanto haya sesión, cubriendo dos caminos por si
 * el intercambio termina antes o después de suscribirnos al listener:
 *  1. onAuthStateChange (SIGNED_IN / INITIAL_SESSION con sesión).
 *  2. getSession() como respaldo si el intercambio ya se completó.
 * Si tras 8s no hay sesión, el intercambio falló y volvemos al login.
 */
export const AuthCallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    let handled = false;

    const goToDashboard = () => {
      if (handled) return;
      handled = true;
      router.navigate({ to: '/dashboard' });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        goToDashboard();
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) goToDashboard();
    });

    const timeout = setTimeout(() => {
      if (!handled) {
        handled = true;
        router.navigate({ to: '/login' });
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-porcelain">
      <div className="flex flex-col items-center gap-4 text-ink-soft">
        <Loader2 className="w-8 h-8 animate-spin text-pine-soft" />
        <p className="text-sm">Completando inicio de sesión...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
