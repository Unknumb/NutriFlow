import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../../shared/api/apiClient';
import { menusApi } from './menusApi';

vi.mock('../../../shared/api/apiClient', () => ({
  apiClient: { post: vi.fn() },
}));

const mockPost = vi.mocked(apiClient.post);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('menusApi.generarMenu', () => {
  it('llama a POST /menus/generar con el payload y devuelve la respuesta', async () => {
    const payload = {
      porciones_disponibles: { cer: 2, veg: 3, cbg: 1 },
      restricciones_dieteticas: ['sin_lactosa'],
    };
    const respuesta = { matches_exactos: [], matches_parciales: [] };
    mockPost.mockResolvedValue({ data: respuesta });
    const result = await menusApi.generarMenu(payload);
    expect(mockPost).toHaveBeenCalledWith('/menus/generar', payload);
    expect(result).toEqual(respuesta);
  });

  it('funciona sin restricciones ni alimentos rechazados (payload mínimo)', async () => {
    const payload = { porciones_disponibles: {} };
    mockPost.mockResolvedValue({ data: { matches_exactos: [], matches_parciales: [] } });
    await menusApi.generarMenu(payload);
    expect(mockPost).toHaveBeenCalledWith('/menus/generar', payload);
  });
});
