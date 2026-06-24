import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { perfilKeys } from '../../../shared/api/queryKeys';
import { usePerfilNutricionista, useUpdatePerfil } from './usePerfil';

// vi.hoisted garantiza que estos valores estén disponibles dentro de vi.mock (que se hoistea)
const mockGetUser = vi.hoisted(() => vi.fn());
const mockUpdateUser = vi.hoisted(() => vi.fn());
const mockSingle = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => ({
  select: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: mockSingle,
}));

vi.mock('../../../shared/utils/supabase', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
      updateUser: mockUpdateUser,
    },
    from: vi.fn(() => mockFrom),
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);
const mockUseQueryClient = vi.mocked(useQueryClient);
const mockInvalidateQueries = vi.fn();

const PERFIL = {
  id: 'user-1',
  nombre: 'Ana',
  apellido: 'González',
  registro_profesional: null,
  email: 'ana@test.com',
  avatar_url: null,
  fecha_creacion: '2025-01-01T00:00:00.000Z',
};

const USER_ACTIVO = { id: 'user-1', email: 'ana@test.com' };

beforeEach(() => {
  vi.clearAllMocks();
  mockUseQuery.mockReturnValue({ data: undefined, isLoading: false } as any);
  mockUseQueryClient.mockReturnValue({ invalidateQueries: mockInvalidateQueries } as any);

  // Defaults de Supabase
  mockGetUser.mockResolvedValue({ data: { user: USER_ACTIVO }, error: null });
  mockUpdateUser.mockResolvedValue({ data: {}, error: null });
  mockSingle.mockResolvedValue({ data: PERFIL, error: null });
  mockFrom.update.mockReturnThis();
  mockFrom.eq.mockReturnThis();

  // Mock useMutation con onSuccess
  mockUseMutation.mockImplementation((options: any) => ({
    mutateAsync: vi.fn(async (vars: any) => {
      const data = await options.mutationFn(vars);
      await options.onSuccess?.(data, vars, undefined);
      return data;
    }),
    mutate: vi.fn(),
    isPending: false,
  } as any));
});

describe('usePerfilNutricionista', () => {
  it('usa perfilKeys.all como queryKey', () => {
    renderHook(() => usePerfilNutricionista());
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryKey).toEqual(perfilKeys.all);
  });

  it('queryFn llama a supabase.auth.getUser y luego a supabase.from("perfiles_nutricionistas")', async () => {
    renderHook(() => usePerfilNutricionista());
    const [opts] = mockUseQuery.mock.calls[0] as any;
    const result = await opts.queryFn();
    expect(mockGetUser).toHaveBeenCalled();
    expect(result).toEqual(PERFIL);
  });

  it('queryFn lanza error cuando no hay usuario activo', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    renderHook(() => usePerfilNutricionista());
    const [opts] = mockUseQuery.mock.calls[0] as any;
    await expect(opts.queryFn()).rejects.toThrow('No hay sesión activa');
  });
});

describe('useUpdatePerfil', () => {
  it('en onSuccess invalida perfilKeys.all', async () => {
    const { result } = renderHook(() => useUpdatePerfil());
    await result.current.mutateAsync({ nombre: 'Ana', apellido: 'González', registro_profesional: null });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: perfilKeys.all });
  });

  it('mutationFn lanza error cuando nombre está vacío', async () => {
    let capturedMutationFn: any;
    mockUseMutation.mockImplementationOnce((options: any) => {
      capturedMutationFn = options.mutationFn;
      return { mutateAsync: vi.fn(), isPending: false } as any;
    });
    renderHook(() => useUpdatePerfil());
    await expect(capturedMutationFn({ nombre: '', apellido: 'González', registro_profesional: null }))
      .rejects.toThrow('El nombre y el apellido son obligatorios');
  });

  it('mutationFn lanza error cuando apellido está vacío', async () => {
    let capturedMutationFn: any;
    mockUseMutation.mockImplementationOnce((options: any) => {
      capturedMutationFn = options.mutationFn;
      return { mutateAsync: vi.fn(), isPending: false } as any;
    });
    renderHook(() => useUpdatePerfil());
    await expect(capturedMutationFn({ nombre: 'Ana', apellido: '   ', registro_profesional: null }))
      .rejects.toThrow('El nombre y el apellido son obligatorios');
  });

  it('mutationFn omite avatar_url del update cuando no se incluye en el payload', async () => {
    let capturedMutationFn: any;
    mockUseMutation.mockImplementationOnce((options: any) => {
      capturedMutationFn = options.mutationFn;
      return { mutateAsync: vi.fn(), isPending: false } as any;
    });
    renderHook(() => useUpdatePerfil());
    await capturedMutationFn({ nombre: 'Ana', apellido: 'González', registro_profesional: null });
    const updateCall = mockFrom.update.mock.calls[0][0];
    expect(updateCall).not.toHaveProperty('avatar_url');
  });

  it('mutationFn incluye avatar_url cuando se pasa en el payload', async () => {
    let capturedMutationFn: any;
    mockUseMutation.mockImplementationOnce((options: any) => {
      capturedMutationFn = options.mutationFn;
      return { mutateAsync: vi.fn(), isPending: false } as any;
    });
    renderHook(() => useUpdatePerfil());
    await capturedMutationFn({ nombre: 'Ana', apellido: 'González', registro_profesional: null, avatar_url: 'https://cdn.example.com/foto.jpg' });
    const updateCall = mockFrom.update.mock.calls[0][0];
    expect(updateCall).toHaveProperty('avatar_url', 'https://cdn.example.com/foto.jpg');
  });
});
