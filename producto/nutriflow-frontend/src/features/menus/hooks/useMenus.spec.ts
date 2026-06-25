import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMutation } from '@tanstack/react-query';
import { menusApi } from '../services/menusApi';
import { useGenerarMenu } from './useMenus';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
}));

vi.mock('../services/menusApi', () => ({
  menusApi: {
    generarMenu: vi.fn().mockResolvedValue({ matches_exactos: [], matches_parciales: [] }),
  },
}));

const mockUseMutation = vi.mocked(useMutation);

beforeEach(() => {
  vi.clearAllMocks();
  mockUseMutation.mockImplementation((options: any) => ({
    mutateAsync: vi.fn(async (vars: any) => options.mutationFn(vars)),
    mutate: vi.fn(),
    isPending: false,
  } as any));
});

describe('useGenerarMenu', () => {
  it('usa menusApi.generarMenu como mutationFn', async () => {
    const { result } = renderHook(() => useGenerarMenu());
    const payload = { porciones_disponibles: { cer: 2 } };
    await result.current.mutateAsync(payload);
    expect(menusApi.generarMenu).toHaveBeenCalledWith(payload);
  });

  it('no tiene onSuccess (no invalida caché — es un resultado one-shot)', () => {
    renderHook(() => useGenerarMenu());
    const [opts] = mockUseMutation.mock.calls[0] as any;
    expect(opts.onSuccess).toBeUndefined();
  });

  it('devuelve la respuesta del backend directamente', async () => {
    const respuesta = { matches_exactos: [{ id: 'r1', nombre: 'Ensalada', ingredientes: [], porciones_requeridas: {} }], matches_parciales: [] };
    vi.mocked(menusApi.generarMenu).mockResolvedValueOnce(respuesta);
    const { result } = renderHook(() => useGenerarMenu());
    const res = await result.current.mutateAsync({ porciones_disponibles: {} });
    expect(res).toEqual(respuesta);
  });
});
