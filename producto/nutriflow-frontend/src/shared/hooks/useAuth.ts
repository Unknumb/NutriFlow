import { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';

interface LoginCredentials {
  email: string;
  password: string;
}

interface UseAuthReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoggingIn: boolean;
  loginError: string | null;
}

export function useAuth(): UseAuthReturn {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = async ({ email, password }: LoginCredentials) => {
    setIsLoggingIn(true);
    setLoginError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Traducimos los errores más comunes de Supabase al español
      const errorMessages: Record<string, string> = {
        'Invalid login credentials': 'Credenciales inválidas. Verifica tu email y contraseña.',
        'Email not confirmed': 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.',
        'Too many requests': 'Demasiados intentos. Espera unos minutos e intenta de nuevo.',
      };
      setLoginError(errorMessages[error.message] || error.message);
      setIsLoggingIn(false);
      return;
    }

    // La sesión se actualiza automáticamente vía onAuthStateChange en main.tsx
    setIsLoggingIn(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    useAuthStore.getState().clear();
  };

  return { login, logout, isLoggingIn, loginError };
}
