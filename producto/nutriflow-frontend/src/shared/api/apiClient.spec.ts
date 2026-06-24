import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// vi.mock se alza al inicio del archivo por Vitest — el mock está activo antes del import de apiClient
vi.mock('../utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

import { apiClient } from './apiClient';
import { supabase } from '../utils/supabase';

// Extraemos las funciones de interceptor tal como quedaron registradas al importar el módulo.
// Axios las almacena en .handlers[n].fulfilled / .rejected (API interna, estable en v1.x).
const requestFulfilled = (
  apiClient.interceptors.request as unknown as {
    handlers: Array<{ fulfilled: (c: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> }>;
  }
).handlers[0].fulfilled;

const responseRejected = (
  apiClient.interceptors.response as unknown as {
    handlers: Array<{ rejected: (e: AxiosError) => Promise<never> }>;
  }
).handlers[0].rejected;

// ─────────────────────────────────────────────────────────────────────────────

describe('apiClient', () => {
  beforeEach(() => {
    // Evita que el interceptor de 401 crashee al asignar window.location.href
    vi.stubGlobal('window', { location: { href: '' } });
    // Silenciamos console.error para mantener limpia la salida de la suite
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  // ── 1. Request Interceptor ─────────────────────────────────────────────────

  describe('Interceptor de petición — inyección de token', () => {
    it('agrega Authorization: Bearer <token> cuando Supabase devuelve sesión activa', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'fake-token' } as never },
        error: null,
      });

      const config = { headers: {} } as InternalAxiosRequestConfig;
      const result = await requestFulfilled(config);

      expect(result.headers['Authorization']).toBe('Bearer fake-token');
    });

    it('NO agrega el header Authorization cuando la sesión es nula', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const config = { headers: {} } as InternalAxiosRequestConfig;
      const result = await requestFulfilled(config);

      expect(result.headers).not.toHaveProperty('Authorization');
    });
  });

  // ── 2. Response Interceptor ────────────────────────────────────────────────

  describe('Interceptor de respuesta — error 401 (sesión expirada)', () => {
    it('ejecuta signOut, asigna window.location.href = /login y rechaza la promesa', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      const error = {
        response: { status: 401, data: {} },
      } as unknown as AxiosError;

      await expect(responseRejected(error)).rejects.toBe(error);

      expect(supabase.auth.signOut).toHaveBeenCalledOnce();
      expect(window.location.href).toBe('/login');
    });
  });

  describe('Interceptor de respuesta — otros errores (sin cerrar sesión)', () => {
    it('rechaza con el error original ante un 400 y NO llama a signOut', async () => {
      const error = {
        response: { status: 400, data: { message: 'Datos inválidos', error: 'Bad Request', statusCode: 400 } },
      } as unknown as AxiosError;

      await expect(responseRejected(error)).rejects.toBe(error);
      expect(supabase.auth.signOut).not.toHaveBeenCalled();
    });

    it('rechaza con el error original ante un 500 y NO llama a signOut', async () => {
      const error = {
        response: { status: 500, data: {} },
      } as unknown as AxiosError;

      await expect(responseRejected(error)).rejects.toBe(error);
      expect(supabase.auth.signOut).not.toHaveBeenCalled();
    });

    it('rechaza con el error original ante error de red sin response y NO llama a signOut', async () => {
      const error = { response: undefined } as unknown as AxiosError;

      await expect(responseRejected(error)).rejects.toBe(error);
      expect(supabase.auth.signOut).not.toHaveBeenCalled();
    });
  });
});
