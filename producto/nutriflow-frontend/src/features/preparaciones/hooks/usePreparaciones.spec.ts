import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preparacionesApi } from '../services/preparacionesApi';
import { preparacionesKeys } from '../../../shared/api/queryKeys';
import {
  usePreparaciones,
  useCrearPreparacion,
  useActualizarPreparacion,
  useEliminarPreparacion,
} from './usePreparaciones';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('../services/preparacionesApi', () => ({
  preparacionesApi: {
    listar: vi.fn().mockResolvedValue([]),
    crear: vi.fn().mockResolvedValue({ id: 'prep-1' }),
    actualizar: vi.fn().mockResolvedValue({ id: 'prep-1' }),
    eliminar: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);
const mockUseQueryClient = vi.mocked(useQueryClient);
const mockInvalidateQueries = vi.fn();

const configurarMutacion = () => {
  mockUseMutation.mockImplementation((options: any) => ({
    mutateAsync: vi.fn(async (vars: any) => {
      const data = await options.mutationFn(vars);
      await options.onSuccess?.(data, vars, undefined);
      return data;
    }),
    mutate: vi.fn(),
    isPending: false,
  } as any));
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseQuery.mockReturnValue({ data: undefined, isLoading: false } as any);
  mockUseQueryClient.mockReturnValue({ invalidateQueries: mockInvalidateQueries } as any);
  configurarMutacion();
});

describe('usePreparaciones', () => {
  it('usa preparacionesKeys.all como queryKey', () => {
    renderHook(() => usePreparaciones());
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryKey).toEqual(preparacionesKeys.all);
  });

  it('usa preparacionesApi.listar como queryFn', () => {
    renderHook(() => usePreparaciones());
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryFn).toBe(preparacionesApi.listar);
  });

  it('staleTime es 5 minutos (300000 ms)', () => {
    renderHook(() => usePreparaciones());
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.staleTime).toBe(300_000);
  });
});

describe('useCrearPreparacion', () => {
  it('en onSuccess invalida preparacionesKeys.all', async () => {
    const { result } = renderHook(() => useCrearPreparacion());
    await result.current.mutateAsync({ nombre: 'Ensalada verde', ingredientes: [] } as any);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: preparacionesKeys.all });
  });
});

describe('useActualizarPreparacion', () => {
  it('en onSuccess invalida preparacionesKeys.all', async () => {
    const { result } = renderHook(() => useActualizarPreparacion());
    await result.current.mutateAsync({ id: 'prep-1', payload: { nombre: 'Ensalada actualizada' } } as any);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: preparacionesKeys.all });
  });
});

describe('useEliminarPreparacion', () => {
  it('en onSuccess invalida preparacionesKeys.all', async () => {
    const { result } = renderHook(() => useEliminarPreparacion());
    await result.current.mutateAsync('prep-1');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: preparacionesKeys.all });
  });
});
