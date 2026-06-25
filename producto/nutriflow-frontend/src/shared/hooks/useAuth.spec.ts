import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { supabase } from '../utils/supabase';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// vi.hoisted garantiza que mockClear/mockSetSession estén resueltos cuando
// la factory de vi.mock se ejecuta (ambos se alzan al top del archivo).
const { mockClear, mockSetSession } = vi.hoisted(() => ({
  mockClear: vi.fn(),
  mockSetSession: vi.fn(),
}));

vi.mock('../utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// useAuthStore se usa como objeto estático (getState), no como React hook.
vi.mock('../store/useAuthStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      clear: mockClear,
      setSession: mockSetSession,
    })),
  },
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CREDENTIALS = { email: 'nutricionista@nutriflow.cl', password: 'password123' };

const SIGNUP_DATA = {
  email: 'nuevo@nutriflow.cl',
  password: 'password123',
  nombre: 'Ana',
  apellido: 'López',
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 1. Traducción de errores ───────────────────────────────────────────────

  describe('translateError — mensajes de Supabase a español', () => {
    it.each([
      [
        'Invalid login credentials',
        'Credenciales inválidas. Verifica tu email y contraseña.',
      ],
      [
        'Email not confirmed',
        'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.',
      ],
      [
        'Too many requests',
        'Demasiados intentos. Espera unos minutos e intenta de nuevo.',
      ],
    ])(
      'traduce "%s" al mensaje en español correcto',
      async (supabaseMsg, mensajeEsperado) => {
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
          data: { user: null, session: null },
          error: { message: supabaseMsg } as any,
        });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.login(CREDENTIALS);
        });

        expect(result.current.loginError).toBe(mensajeEsperado);
      },
    );

    it('deja el mensaje sin traducir cuando no está en el mapeo conocido', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'some_unmapped_supabase_error' } as any,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login(CREDENTIALS);
      });

      expect(result.current.loginError).toBe('some_unmapped_supabase_error');
    });
  });

  // ── 2. Login exitoso ───────────────────────────────────────────────────────

  describe('login — credenciales válidas', () => {
    it('pone isLoggingIn en false y loginError en null tras éxito', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: { id: 'user-1', email: CREDENTIALS.email } as any,
          session: { access_token: 'tok_abc123', user: { id: 'user-1' } as any },
        },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login(CREDENTIALS);
      });

      expect(result.current.isLoggingIn).toBe(false);
      expect(result.current.loginError).toBeNull();
    });

    // El hook delega la actualización del store al listener global (onAuthStateChange
    // en main.tsx); NO llama a setSession directamente tras signInWithPassword.
    it('no llama a useAuthStore.getState().setSession directamente', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: { id: 'user-1' } as any,
          session: { access_token: 'tok_abc123', user: { id: 'user-1' } as any },
        },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login(CREDENTIALS);
      });

      expect(mockSetSession).not.toHaveBeenCalled();
    });

    it('establece loginError con el mensaje traducido cuando signInWithPassword falla', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' } as any,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login(CREDENTIALS);
      });

      expect(result.current.loginError).toBe(
        'Credenciales inválidas. Verifica tu email y contraseña.',
      );
      expect(result.current.isLoggingIn).toBe(false);
    });
  });

  // ── 3. Registro — confirmación de correo pendiente ────────────────────────

  describe('signUp — email con confirmación pendiente', () => {
    it('retorna { error: null, needsEmailConfirmation: true } cuando session es null', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: {
          // identities con un elemento → usuario nuevo, pero confirmación requerida
          user: { id: 'uid-new', identities: [{ id: 'identity-1' }] } as any,
          session: null,
        },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      let authResult!: Awaited<ReturnType<typeof result.current.signUp>>;

      await act(async () => {
        authResult = await result.current.signUp(SIGNUP_DATA);
      });

      expect(authResult.error).toBeNull();
      expect(authResult.needsEmailConfirmation).toBe(true);
    });
  });

  // ── 4. Registro — identidad duplicada (identities vacío) ─────────────────

  describe('signUp — identidad duplicada', () => {
    // Supabase devuelve identities: [] (sin lanzar un error explícito) cuando el
    // email ya existe; el hook lo detecta y retorna un mensaje de error legible.
    it('retorna error de correo duplicado cuando identities.length === 0', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: {
          user: { id: 'uid-existing', identities: [] } as any,
          session: null,
        },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      let authResult!: Awaited<ReturnType<typeof result.current.signUp>>;

      await act(async () => {
        authResult = await result.current.signUp({
          email: 'duplicado@nutriflow.cl',
          password: 'pass123',
          nombre: 'Carlos',
          apellido: 'Ruiz',
        });
      });

      expect(authResult.error).toBe(
        'Este correo ya está registrado. Intenta iniciar sesión.',
      );
      expect(authResult.needsEmailConfirmation).toBeUndefined();
    });
  });
});
