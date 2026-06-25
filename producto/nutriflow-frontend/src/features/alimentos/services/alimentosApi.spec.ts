import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../../shared/api/apiClient';
import { alimentosApi } from './alimentosApi';

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

beforeEach(() => {
  vi.clearAllMocks();
});

const ALIMENTO = {
  id: 'ali-1',
  nombre: 'Pechuga de pollo',
  marca: null,
  categoria: 'carnes',
  calorias_100g: 165,
  proteinas_100g: 31,
  carbohidratos_100g: 0,
  grasas_100g: 3.6,
  restricciones: [],
};

describe('alimentosApi', () => {
  describe('buscar', () => {
    it('llama a GET /alimentos con params y devuelve data', async () => {
      const respuesta = { items: [ALIMENTO], total: 1, limit: 20, offset: 0 };
      mockGet.mockResolvedValue({ data: respuesta });
      const result = await alimentosApi.buscar({ search: 'pollo', limit: 20, offset: 0 });
      expect(mockGet).toHaveBeenCalledWith('/alimentos', { params: { search: 'pollo', limit: 20, offset: 0 } });
      expect(result).toEqual(respuesta);
    });

    it('acepta llamada sin parámetros opcionales', async () => {
      mockGet.mockResolvedValue({ data: { items: [], total: 0, limit: 20, offset: 0 } });
      await alimentosApi.buscar({});
      expect(mockGet).toHaveBeenCalledWith('/alimentos', { params: {} });
    });
  });

  describe('categorias', () => {
    it('llama a GET /alimentos/categorias y devuelve array de strings', async () => {
      const cats = ['cereales', 'carnes', 'verduras'];
      mockGet.mockResolvedValue({ data: cats });
      const result = await alimentosApi.categorias();
      expect(mockGet).toHaveBeenCalledWith('/alimentos/categorias');
      expect(result).toEqual(cats);
    });
  });

  describe('crear', () => {
    it('llama a POST /alimentos con el payload y devuelve el alimento creado', async () => {
      const payload = { nombre: 'Quinoa', calorias_100g: 368, proteinas_100g: 14, carbohidratos_100g: 64, grasas_100g: 6 };
      mockPost.mockResolvedValue({ data: { id: 'ali-2', ...payload, marca: null, categoria: null, restricciones: [] } });
      const result = await alimentosApi.crear(payload);
      expect(mockPost).toHaveBeenCalledWith('/alimentos', payload);
      expect(result.nombre).toBe('Quinoa');
    });
  });

  describe('actualizar', () => {
    it('llama a PATCH /alimentos/:id con cambios parciales y devuelve el alimento actualizado', async () => {
      const cambios = { nombre: 'Pechuga de pavo' };
      mockPatch.mockResolvedValue({ data: { ...ALIMENTO, ...cambios } });
      const result = await alimentosApi.actualizar('ali-1', cambios);
      expect(mockPatch).toHaveBeenCalledWith('/alimentos/ali-1', cambios);
      expect(result.nombre).toBe('Pechuga de pavo');
    });
  });

  describe('eliminar', () => {
    it('llama a DELETE /alimentos/:id y no devuelve datos', async () => {
      mockDelete.mockResolvedValue({ data: undefined });
      await expect(alimentosApi.eliminar('ali-1')).resolves.toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith('/alimentos/ali-1');
    });
  });
});
