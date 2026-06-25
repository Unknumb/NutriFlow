import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../../shared/api/apiClient';
import { evaluacionesApi } from './evaluacionesApi';

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

const EVALUACION = { id: 'ev-1', paciente_id: 'p-1', peso: 70, talla: 165, fecha: '2025-01-01' };

beforeEach(() => { vi.clearAllMocks(); });

describe('evaluacionesApi', () => {
  describe('fetchEvaluacionesByPaciente', () => {
    it('llama a GET /evaluaciones/paciente/:id y devuelve response.data', async () => {
      mockGet.mockResolvedValue({ data: [EVALUACION] });
      const result = await evaluacionesApi.fetchEvaluacionesByPaciente('p-1');
      expect(mockGet).toHaveBeenCalledWith('/evaluaciones/paciente/p-1');
      expect(result).toEqual([EVALUACION]);
    });
  });

  describe('fetchEvaluacion', () => {
    it('llama a GET /evaluaciones/:id y devuelve response.data', async () => {
      mockGet.mockResolvedValue({ data: EVALUACION });
      const result = await evaluacionesApi.fetchEvaluacion('ev-1');
      expect(mockGet).toHaveBeenCalledWith('/evaluaciones/ev-1');
      expect(result).toEqual(EVALUACION);
    });
  });

  describe('createEvaluacion', () => {
    it('llama a POST /evaluaciones con el payload y devuelve la respuesta', async () => {
      const payload = { paciente_id: 'p-1', peso: 70, talla: 165 };
      const respuesta = { evaluacion: EVALUACION, calculos: {} };
      mockPost.mockResolvedValue({ data: respuesta });
      const result = await evaluacionesApi.createEvaluacion(payload as any);
      expect(mockPost).toHaveBeenCalledWith('/evaluaciones', payload);
      expect(result).toEqual(respuesta);
    });
  });

  describe('updateEvaluacion', () => {
    it('llama a PATCH /evaluaciones/:id con cambios parciales y devuelve la evaluación actualizada', async () => {
      const cambios = { peso: 72 };
      mockPatch.mockResolvedValue({ data: { ...EVALUACION, ...cambios } });
      const result = await evaluacionesApi.updateEvaluacion('ev-1', cambios);
      expect(mockPatch).toHaveBeenCalledWith('/evaluaciones/ev-1', cambios);
      expect(result.peso).toBe(72);
    });
  });

  describe('deleteEvaluacion', () => {
    it('llama a DELETE /evaluaciones/:id y no devuelve datos', async () => {
      mockDelete.mockResolvedValue({ data: undefined });
      await expect(evaluacionesApi.deleteEvaluacion('ev-1')).resolves.toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith('/evaluaciones/ev-1');
    });
  });
});
