import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../shared/utils/supabase';
import { useRouter } from '@tanstack/react-router';

export const AuthCallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    console.log('[auth/callback] montado, URL:', window.location.href);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[auth/callback] onAuthStateChange:', event, !!session);
      if (event === 'SIGNED_IN' && session) {
        console.log('[auth/callback] SIGNED_IN ok → dashboard');
        subscription.unsubscribe();
        router.navigate({ to: '/dashboard' });
      }
    });

    // Verificar si ya hay sesión activa (usuario ya estaba logueado)
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('[auth/callback] getSession result:', !!data.session, error?.message);
    });

    const timeout = setTimeout(() => {
      console.log('[auth/callback] timeout 10s → login');
      subscription.unsubscribe();
      router.navigate({ to: '/login' });
    }, 10000);

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
