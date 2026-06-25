import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pacientesApi } from '../services/pacientesApi';
import { pacientesKeys } from '../../../shared/api/queryKeys';
import {
  usePacientes,
  usePaciente,
  useCreatePaciente,
  useUpdatePaciente,
  useDeletePaciente,
} from './usePacientes';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('../services/pacientesApi', () => ({
  pacientesApi: {
    fetchPacientes: vi.fn().mockResolvedValue([]),
    fetchPaciente: vi.fn().mockResolvedValue({ id: 'p-1' }),
    createPaciente: vi.fn().mockResolvedValue({ id: 'p-1' }),
    updatePaciente: vi.fn().mockResolvedValue({ id: 'p-1' }),
    deletePaciente: vi.fn().mockResolvedValue(null),
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

describe('usePacientes', () => {
  it('usa pacientesKeys.all como queryKey', () => {
    renderHook(() => usePacientes());
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryKey).toEqual(pacientesKeys.all);
  });

  it('usa pacientesApi.fetchPacientes como queryFn', () => {
    renderHook(() => usePacientes());
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryFn).toBe(pacientesApi.fetchPacientes);
  });
});

describe('usePaciente', () => {
  it('usa pacientesKeys.detail(id) como queryKey', () => {
    renderHook(() => usePaciente('p-1'));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryKey).toEqual(pacientesKeys.detail('p-1'));
  });

  it('enabled=true cuando id es truthy', () => {
    renderHook(() => usePaciente('p-1'));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(true);
  });

  it('enabled=false cuando id es string vacío', () => {
    renderHook(() => usePaciente(''));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(false);
  });
});

describe('useCreatePaciente', () => {
  it('en onSuccess invalida pacientesKeys.all', async () => {
    const { result } = renderHook(() => useCreatePaciente());
    await result.current.mutateAsync({ nombre: 'Ana', rut: '12345678-9', edad: 30, sexo: 'F', talla: 165, peso: 60 } as any);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: pacientesKeys.all });
  });
});

describe('useUpdatePaciente', () => {
  it('en onSuccess invalida pacientesKeys.all', async () => {
    const { result } = renderHook(() => useUpdatePaciente());
    await result.current.mutateAsync({ id: 'p-1', payload: { peso: 65 } });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: pacientesKeys.all });
  });

  it('en onSuccess también invalida el detalle del paciente actualizado', async () => {
    const { result } = renderHook(() => useUpdatePaciente());
    await result.current.mutateAsync({ id: 'p-1', payload: { peso: 65 } });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: pacientesKeys.detail('p-1') });
  });
});

describe('useDeletePaciente', () => {
  it('en onSuccess invalida pacientesKeys.all', async () => {
    const { result } = renderHook(() => useDeletePaciente());
    await result.current.mutateAsync('p-1');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: pacientesKeys.all });
  });
});
