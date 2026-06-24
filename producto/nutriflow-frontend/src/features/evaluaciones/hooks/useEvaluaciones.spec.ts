import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesApi } from '../services/evaluacionesApi';
import { pacientesKeys } from '../../../shared/api/queryKeys';
import {
  useEvaluacionesByPaciente,
  useCreateEvaluacion,
  useDeleteEvaluacion,
} from './useEvaluaciones';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('../services/evaluacionesApi', () => ({
  evaluacionesApi: {
    fetchEvaluacionesByPaciente: vi.fn().mockResolvedValue([]),
    createEvaluacion: vi.fn().mockResolvedValue({
      evaluacion: { id: 'ev-1', paciente_id: 'p-1' },
      calculos: {},
    }),
    deleteEvaluacion: vi.fn().mockResolvedValue(null),
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

describe('useEvaluacionesByPaciente', () => {
  it('usa pacientesKeys.evaluaciones(pacienteId) cuando id es truthy', () => {
    renderHook(() => useEvaluacionesByPaciente('p-1'));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryKey).toEqual(pacientesKeys.evaluaciones('p-1'));
  });

  it('usa [] como queryKey cuando pacienteId es undefined', () => {
    renderHook(() => useEvaluacionesByPaciente(undefined));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryKey).toEqual([]);
  });

  it('enabled=true cuando pacienteId es truthy', () => {
    renderHook(() => useEvaluacionesByPaciente('p-1'));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(true);
  });

  it('enabled=false cuando pacienteId es undefined', () => {
    renderHook(() => useEvaluacionesByPaciente(undefined));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(false);
  });

  it('enabled=false cuando pacienteId es string vacío', () => {
    renderHook(() => useEvaluacionesByPaciente(''));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(false);
  });
});

describe('useCreateEvaluacion', () => {
  it('en onSuccess invalida evaluaciones del paciente (usando data.evaluacion.paciente_id)', async () => {
    const { result } = renderHook(() => useCreateEvaluacion());
    await result.current.mutateAsync({ paciente_id: 'p-1', peso: 70 } as any);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: pacientesKeys.evaluaciones('p-1'),
    });
  });
});

describe('useDeleteEvaluacion', () => {
  it('en onSuccess invalida evaluaciones del paciente (usando el id del hook)', async () => {
    const { result } = renderHook(() => useDeleteEvaluacion('p-1'));
    await result.current.mutateAsync('ev-1');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: pacientesKeys.evaluaciones('p-1'),
    });
  });
});
