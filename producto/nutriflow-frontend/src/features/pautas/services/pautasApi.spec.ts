import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../../shared/api/apiClient';
import { pautasApi } from './pautasApi';

vi.mock('../../../shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPatch = vi.mocked(apiClient.patch);
const mockDelete = vi.mocked(apiClient.delete);

const PAUTA = { id: 'pau-1', paciente_id: 'p-1', nombre: 'Pauta inicial', fecha_creacion: '2025-01-01' };

beforeEach(() => { vi.clearAllMocks(); });

describe('pautasApi', () => {
  describe('fetchPautas', () => {
    it('llama a GET /pautas y devuelve response.data', async () => {
      mockGet.mockResolvedValue({ data: [PAUTA] });
      const result = await pautasApi.fetchPautas();
      expect(mockGet).toHaveBeenCalledWith('/pautas');
      expect(result).toEqual([PAUTA]);
    });
  });

  describe('fetchPauta', () => {
    it('llama a GET /pautas/:id y devuelve response.data', async () => {
      mockGet.mockResolvedValue({ data: PAUTA });
      const result = await pautasApi.fetchPauta('pau-1');
      expect(mockGet).toHaveBeenCalledWith('/pautas/pau-1');
      expect(result).toEqual(PAUTA);
    });
  });

  describe('createPauta', () => {
    it('llama a POST /pautas con el payload y devuelve la pauta creada', async () => {
      const payload = { paciente_id: 'p-1', nombre: 'Pauta nueva' };
      mockPost.mockResolvedValue({ data: { id: 'pau-nuevo', ...payload } });
      const result = await pautasApi.createPauta(payload as any);
      expect(mockPost).toHaveBeenCalledWith('/pautas', payload);
      expect(result).toHaveProperty('id', 'pau-nuevo');
    });
  });

  describe('updatePauta', () => {
    it('llama a PATCH /pautas/:id con el payload y devuelve la pauta actualizada', async () => {
      const payload = { nombre: 'Pauta modificada' };
      mockPatch.mockResolvedValue({ data: { ...PAUTA, ...payload } });
      const result = await pautasApi.updatePauta('pau-1', payload as any);
      expect(mockPatch).toHaveBeenCalledWith('/pautas/pau-1', payload);
      expect(result.nombre).toBe('Pauta modificada');
    });
  });

  describe('deletePauta', () => {
    it('llama a DELETE /pautas/:id y no devuelve datos', async () => {
      mockDelete.mockResolvedValue({ data: undefined });
      await expect(pautasApi.deletePauta('pau-1')).resolves.toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith('/pautas/pau-1');
    });
  });
});
