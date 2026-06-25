import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../../shared/api/apiClient';
import { pacientesApi } from './pacientesApi';

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

const PACIENTE = { id: 'p-1', nombre: 'Ana González', rut: '12345678-9', edad: 30, sexo: 'F', talla: 165, peso: 60 };

beforeEach(() => { vi.clearAllMocks(); });

describe('pacientesApi', () => {
  describe('fetchPacientes', () => {
    it('llama a GET /pacientes y devuelve response.data', async () => {
      mockGet.mockResolvedValue({ data: [PACIENTE] });
      const result = await pacientesApi.fetchPacientes();
      expect(mockGet).toHaveBeenCalledWith('/pacientes');
      expect(result).toEqual([PACIENTE]);
    });
  });

  describe('fetchPaciente', () => {
    it('llama a GET /pacientes/:id y devuelve response.data', async () => {
      mockGet.mockResolvedValue({ data: PACIENTE });
      const result = await pacientesApi.fetchPaciente('p-1');
      expect(mockGet).toHaveBeenCalledWith('/pacientes/p-1');
      expect(result).toEqual(PACIENTE);
    });
  });

  describe('createPaciente', () => {
    it('llama a POST /pacientes con el payload y devuelve el paciente creado', async () => {
      const payload = { nombre: 'Ana González', rut: '12345678-9', edad: 30, sexo: 'F', talla: 165, peso: 60 };
      mockPost.mockResolvedValue({ data: { id: 'p-nuevo', ...payload } });
      const result = await pacientesApi.createPaciente(payload as any);
      expect(mockPost).toHaveBeenCalledWith('/pacientes', payload);
      expect(result).toHaveProperty('id', 'p-nuevo');
    });
  });

  describe('updatePaciente', () => {
    it('llama a PATCH /pacientes/:id con el payload parcial y devuelve el paciente actualizado', async () => {
      const payload = { peso: 62 };
      mockPatch.mockResolvedValue({ data: { ...PACIENTE, ...payload } });
      const result = await pacientesApi.updatePaciente('p-1', payload as any);
      expect(mockPatch).toHaveBeenCalledWith('/pacientes/p-1', payload);
      expect(result.peso).toBe(62);
    });
  });

  describe('deletePaciente', () => {
    it('llama a DELETE /pacientes/:id y no devuelve datos', async () => {
      mockDelete.mockResolvedValue({ data: undefined });
      await expect(pacientesApi.deletePaciente('p-1')).resolves.toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith('/pacientes/p-1');
    });
  });
});
