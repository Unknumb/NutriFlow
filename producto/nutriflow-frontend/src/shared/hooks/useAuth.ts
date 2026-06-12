import { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignUpData extends LoginCredentials {
  nombre: string;
  apellido: string;
}

interface AuthResult {
  error: string | null;
  /** true cuando el registro requiere confirmación de email antes de poder iniciar sesión */
  needsEmailConfirmation?: boolean;
}

interface UseAuthReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (data: SignUpData) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  isLoggingIn: boolean;
  loginError: string | null;
}

// Traducción de los errores más comunes de Supabase Auth al español
const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Credenciales inválidas. Verifica tu email y contraseña.',
  'Email not confirmed': 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.',
  'Too many requests': 'Demasiados intentos. Espera unos minutos e intenta de nuevo.',
  'User already registered': 'Este correo ya está registrado. Intenta iniciar sesión.',
  'Email rate limit exceeded': 'Se han enviado demasiados correos. Espera unos minutos e intenta de nuevo.',
  'New password should be different from the old password.':
    'La nueva contraseña debe ser distinta a la anterior.',
  'Password should be at least 6 characters.': 'La contraseña debe tener al menos 6 caracteres.',
  'Auth session missing!': 'El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo.',
};

function translateError(message: string): string {
  return ERROR_MESSAGES[message] || message;
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
      setLoginError(translateError(error.message));
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

  /**
   * Registro con email y contraseña.
   * Si la confirmación de email está habilitada en Supabase, el usuario
   * recibirá un correo y `needsEmailConfirmation` será true.
   */
  const signUp = async ({ email, password, nombre, apellido }: SignUpData): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Tras confirmar el email, Supabase redirige al login
        emailRedirectTo: `${window.location.origin}/login`,
        // El trigger handle_new_user() en Postgres lee estos campos para crear
        // el perfil en perfiles_nutricionistas; el Sidebar los muestra desde user_metadata
        data: {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
        },
      },
    });

    if (error) {
      return { error: translateError(error.message) };
    }

    // Supabase devuelve un usuario con identities vacías cuando el email ya existe
    // (no expone el error directamente por seguridad)
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { error: 'Este correo ya está registrado. Intenta iniciar sesión.' };
    }

    // Sin sesión inmediata => Supabase exige confirmar el correo primero
    return { error: null, needsEmailConfirmation: !data.session };
  };

  /**
   * Envía el correo de recuperación de contraseña.
   * El enlace del correo redirige a /reset-password donde el usuario define la nueva clave.
   */
  const requestPasswordReset = async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { error: translateError(error.message) };
    }
    return { error: null };
  };

  /**
   * Actualiza la contraseña del usuario con sesión activa
   * (incluida la sesión de recuperación creada por el enlace del correo).
   */
  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return { error: translateError(error.message) };
    }
    return { error: null };
  };

  return { login, logout, signUp, requestPasswordReset, updatePassword, isLoggingIn, loginError };
}
