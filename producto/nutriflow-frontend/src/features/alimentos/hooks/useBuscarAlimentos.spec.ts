import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alimentosApi } from '../services/alimentosApi';
import { alimentosKeys } from '../../../shared/api/queryKeys';
import {
  useBuscarAlimentos,
  useCategorias,
  useCrearAlimento,
  useActualizarAlimento,
  useEliminarAlimento,
} from './useBuscarAlimentos';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
  keepPreviousData: Symbol('keepPreviousData'),
}));

vi.mock('../services/alimentosApi', () => ({
  alimentosApi: {
    buscar: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 }),
    categorias: vi.fn().mockResolvedValue([]),
    crear: vi.fn().mockResolvedValue({ id: 'ali-1', nombre: 'Test' }),
    actualizar: vi.fn().mockResolvedValue({ id: 'ali-1', nombre: 'Test' }),
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

describe('useBuscarAlimentos — lógica enabled', () => {
  it('deshabilitado cuando search vacío, sin categoría y permitirSinFiltro=false (defecto)', () => {
    renderHook(() => useBuscarAlimentos({ search: '', categoria: null }));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(false);
  });

  it('habilitado cuando search tiene texto', () => {
    renderHook(() => useBuscarAlimentos({ search: 'pollo', categoria: null }));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(true);
  });

  it('habilitado cuando se especifica categoría (sin texto)', () => {
    renderHook(() => useBuscarAlimentos({ search: '', categoria: 'carnes' }));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(true);
  });

  it('habilitado cuando permitirSinFiltro=true aunque no haya texto ni categoría', () => {
    renderHook(() => useBuscarAlimentos({ search: '', categoria: null, permitirSinFiltro: true }));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(true);
  });

  it('deshabilitado cuando enabled=false externo, incluso con texto', () => {
    renderHook(() => useBuscarAlimentos({ search: 'pollo', categoria: null, enabled: false }));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(false);
  });

  it('el queryKey incluye limit y offset', () => {
    renderHook(() => useBuscarAlimentos({ search: 'arroz', categoria: null, limit: 10, offset: 5 }));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryKey).toContain(10);
    expect(opts.queryKey).toContain(5);
  });

  it('normaliza el search con trim antes de construir la queryKey', () => {
    renderHook(() => useBuscarAlimentos({ search: '  arroz  ', categoria: null, permitirSinFiltro: true }));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    const key: any[] = opts.queryKey;
    expect(key).toContain('arroz');
    expect(key.some((k: any) => typeof k === 'string' && k.includes(' '))).toBe(false);
  });

  it('staleTime es 1 minuto (60000 ms)', () => {
    renderHook(() => useBuscarAlimentos({ search: 'test', categoria: null }));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.staleTime).toBe(60_000);
  });
});

describe('useCategorias', () => {
  it('usa alimentosKeys.categorias() como queryKey', () => {
    renderHook(() => useCategorias());
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryKey).toEqual(alimentosKeys.categorias());
  });

  it('deshabilitado cuando enabled=false', () => {
    renderHook(() => useCategorias(false));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(false);
  });

  it('staleTime es 30 minutos (1800000 ms)', () => {
    renderHook(() => useCategorias());
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.staleTime).toBe(1_800_000);
  });
});

describe('useCrearAlimento', () => {
  it('en onSuccess invalida alimentosKeys.all', async () => {
    const { result } = renderHook(() => useCrearAlimento());
    await result.current.mutateAsync({ nombre: 'Avena', calorias_100g: 389, proteinas_100g: 17, carbohidratos_100g: 66, grasas_100g: 7 });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: alimentosKeys.all });
  });
});

describe('useActualizarAlimento', () => {
  it('en onSuccess invalida alimentosKeys.all', async () => {
    const { result } = renderHook(() => useActualizarAlimento());
    await result.current.mutateAsync({ id: 'ali-1', cambios: { nombre: 'Avena integral' } });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: alimentosKeys.all });
  });
});

describe('useEliminarAlimento', () => {
  it('en onSuccess invalida alimentosKeys.all', async () => {
    const { result } = renderHook(() => useEliminarAlimento());
    await result.current.mutateAsync('ali-1');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: alimentosKeys.all });
  });
});
