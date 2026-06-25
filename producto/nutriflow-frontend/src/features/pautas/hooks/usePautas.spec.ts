import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pautasApi } from '../services/pautasApi';
import { pacientesKeys, pautasKeys } from '../../../shared/api/queryKeys';
import {
  usePautas,
  usePauta,
  useCreatePauta,
  useUpdatePauta,
  useDeletePauta,
} from './usePautas';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('../services/pautasApi', () => ({
  pautasApi: {
    fetchPautas: vi.fn().mockResolvedValue([]),
    fetchPauta: vi.fn().mockResolvedValue({ id: 'pau-1', paciente_id: 'p-1' }),
    createPauta: vi.fn().mockResolvedValue({ id: 'pau-1', paciente_id: 'p-1' }),
    updatePauta: vi.fn().mockResolvedValue({ id: 'pau-1', paciente_id: 'p-1' }),
    deletePauta: vi.fn().mockResolvedValue(null),
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

describe('usePautas', () => {
  it('usa pautasKeys.all como queryKey', () => {
    renderHook(() => usePautas());
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryKey).toEqual(pautasKeys.all);
  });

  it('usa pautasApi.fetchPautas como queryFn', () => {
    renderHook(() => usePautas());
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryFn).toBe(pautasApi.fetchPautas);
  });
});

describe('usePauta', () => {
  it('usa pautasKeys.detail(id) como queryKey cuando id está definido', () => {
    renderHook(() => usePauta('pau-1'));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryKey).toEqual(pautasKeys.detail('pau-1'));
  });

  it('enabled=true cuando id es truthy', () => {
    renderHook(() => usePauta('pau-1'));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(true);
  });

  it('enabled=false cuando id es undefined', () => {
    renderHook(() => usePauta(undefined));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(false);
  });
});

describe('useCreatePauta', () => {
  it('en onSuccess invalida pautasKeys.all', async () => {
    const { result } = renderHook(() => useCreatePauta());
    await result.current.mutateAsync({ paciente_id: 'p-1', nombre: 'Pauta 1' } as any);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: pautasKeys.all });
  });

  it('en onSuccess invalida pacientesKeys.pautas(data.paciente_id)', async () => {
    const { result } = renderHook(() => useCreatePauta());
    await result.current.mutateAsync({ paciente_id: 'p-1', nombre: 'Pauta 1' } as any);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: pacientesKeys.pautas('p-1') });
  });
});

describe('useUpdatePauta', () => {
  it('en onSuccess invalida pautasKeys.all', async () => {
    const { result } = renderHook(() => useUpdatePauta('pau-1'));
    await result.current.mutateAsync({ nombre: 'Pauta actualizada' } as any);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: pautasKeys.all });
  });

  it('en onSuccess invalida el detalle de la pauta', async () => {
    const { result } = renderHook(() => useUpdatePauta('pau-1'));
    await result.current.mutateAsync({ nombre: 'Pauta actualizada' } as any);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: pautasKeys.detail('pau-1') });
  });

  it('en onSuccess invalida pacientesKeys.pautas(data.paciente_id)', async () => {
    const { result } = renderHook(() => useUpdatePauta('pau-1'));
    await result.current.mutateAsync({ nombre: 'Pauta actualizada' } as any);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: pacientesKeys.pautas('p-1') });
  });
});

describe('useDeletePauta', () => {
  it('en onSuccess invalida pautasKeys.all', async () => {
    const { result } = renderHook(() => useDeletePauta('p-1'));
    await result.current.mutateAsync('pau-1');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: pautasKeys.all });
  });

  it('en onSuccess invalida pacientesKeys.pautas(pacienteId)', async () => {
    const { result } = renderHook(() => useDeletePauta('p-1'));
    await result.current.mutateAsync('pau-1');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: pacientesKeys.pautas('p-1') });
  });

  it('en onSuccess invalida ["planificaciones"]', async () => {
    const { result } = renderHook(() => useDeletePauta('p-1'));
    await result.current.mutateAsync('pau-1');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planificaciones'] });
  });

  it('en onSuccess invalida ["pautas-lista", pacienteId]', async () => {
    const { result } = renderHook(() => useDeletePauta('p-1'));
    await result.current.mutateAsync('pau-1');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['pautas-lista', 'p-1'] });
  });
});
