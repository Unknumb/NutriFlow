import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planificacionesApi } from '../api/planificacionesApi';
import {
  usePlanificaciones,
  useCreatePlanificacion,
  useDeletePlanificacion,
  useSetActivaPlanificacion,
} from './usePlanificaciones';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('../api/planificacionesApi', () => ({
  planificacionesApi: {
    getPlanificaciones: vi.fn().mockResolvedValue([]),
    createPlanificacion: vi.fn().mockResolvedValue({ id: 'plan-1', paciente_id: 'p-1' }),
    deletePlanificacion: vi.fn().mockResolvedValue(null),
    setActivaPlanificacion: vi.fn().mockResolvedValue({ id: 'plan-1', activa: true }),
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

describe('usePlanificaciones', () => {
  it('usa queryKey ["planificaciones"]', () => {
    renderHook(() => usePlanificaciones());
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryKey).toEqual(['planificaciones']);
  });

  it('usa planificacionesApi.getPlanificaciones como queryFn', () => {
    renderHook(() => usePlanificaciones());
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryFn).toBe(planificacionesApi.getPlanificaciones);
  });
});

describe('useCreatePlanificacion', () => {
  it('en onSuccess invalida ["planificaciones"]', async () => {
    const { result } = renderHook(() => useCreatePlanificacion());
    await result.current.mutateAsync({ paciente_id: 'p-1', calorias_totales: 2000, distribucion_macros: {} });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planificaciones'] });
  });
});

describe('useDeletePlanificacion', () => {
  it('en onSuccess invalida ["planificaciones"]', async () => {
    const { result } = renderHook(() => useDeletePlanificacion());
    await result.current.mutateAsync('plan-1');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planificaciones'] });
  });
});

describe('useSetActivaPlanificacion', () => {
  it('en onSuccess invalida ["planificaciones"]', async () => {
    const { result } = renderHook(() => useSetActivaPlanificacion());
    await result.current.mutateAsync('plan-1');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planificaciones'] });
  });
});
