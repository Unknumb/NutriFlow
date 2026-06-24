import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../../shared/api/apiClient';
import { preparacionesApi } from './preparacionesApi';

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

const PREPARACION = { id: 'prep-1', nombre: 'Ensalada verde', ingredientes: [], imagen_url: null };

beforeEach(() => { vi.clearAllMocks(); });

describe('preparacionesApi', () => {
  describe('listar', () => {
    it('llama a GET /preparaciones y devuelve response.data', async () => {
      mockGet.mockResolvedValue({ data: [PREPARACION] });
      const result = await preparacionesApi.listar();
      expect(mockGet).toHaveBeenCalledWith('/preparaciones');
      expect(result).toEqual([PREPARACION]);
    });
  });

  describe('crear', () => {
    it('llama a POST /preparaciones con el payload y devuelve la preparación creada', async () => {
      const payload = { nombre: 'Ensalada verde', ingredientes: [] };
      mockPost.mockResolvedValue({ data: { id: 'prep-nuevo', ...payload, imagen_url: null } });
      const result = await preparacionesApi.crear(payload as any);
      expect(mockPost).toHaveBeenCalledWith('/preparaciones', payload);
      expect(result).toHaveProperty('id', 'prep-nuevo');
    });
  });

  describe('actualizar', () => {
    it('llama a PATCH /preparaciones/:id con cambios parciales y devuelve la preparación actualizada', async () => {
      const cambios = { nombre: 'Ensalada mixta' };
      mockPatch.mockResolvedValue({ data: { ...PREPARACION, ...cambios } });
      const result = await preparacionesApi.actualizar('prep-1', cambios as any);
      expect(mockPatch).toHaveBeenCalledWith('/preparaciones/prep-1', cambios);
      expect(result.nombre).toBe('Ensalada mixta');
    });
  });

  describe('eliminar', () => {
    it('llama a DELETE /preparaciones/:id y no devuelve datos', async () => {
      mockDelete.mockResolvedValue({ data: undefined });
      await expect(preparacionesApi.eliminar('prep-1')).resolves.toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith('/preparaciones/prep-1');
    });
  });
});
