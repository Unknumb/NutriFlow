import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../../shared/api/apiClient';
import { planificacionesApi } from './planificacionesApi';
import type { PlanificacionData } from './planificacionesApi';

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

const PLAN = { id: 'plan-1', paciente_id: 'p-1', activa: false, nutricionista_id: 'n-1', fecha_creacion: '', calorias_totales: 2000, distribucion_macros: {} };

describe('planificacionesApi', () => {
  describe('getPlanificaciones', () => {
    it('llama a GET /planificaciones y devuelve response.data', async () => {
      mockGet.mockResolvedValue({ data: [PLAN] });
      const result = await planificacionesApi.getPlanificaciones();
      expect(mockGet).toHaveBeenCalledWith('/planificaciones');
      expect(result).toEqual([PLAN]);
    });
  });

  describe('createPlanificacion', () => {
    it('llama a POST /planificaciones con el payload y devuelve response.data', async () => {
      const payload: PlanificacionData = {
        paciente_id: 'p-1',
        nombre: 'Plan verano',
        calorias_totales: 2000,
        distribucion_macros: { proteina: 25 },
      };
      mockPost.mockResolvedValue({ data: { id: 'plan-nuevo', ...payload } });
      const result = await planificacionesApi.createPlanificacion(payload);
      expect(mockPost).toHaveBeenCalledWith('/planificaciones', payload);
      expect(result).toHaveProperty('id', 'plan-nuevo');
    });
  });

  describe('updatePlanificacion', () => {
    it('llama a PATCH /planificaciones/:id con el payload y devuelve response.data', async () => {
      const data = {
        calorias_totales: 1900,
        distribucion_macros: { proteina: 30, grasa: 25, carbohidratos: 45 },
      };
      mockPatch.mockResolvedValue({ data: { ...PLAN, ...data, activa: true } });
      const result = await planificacionesApi.updatePlanificacion('plan-1', data);
      expect(mockPatch).toHaveBeenCalledWith('/planificaciones/plan-1', data);
      expect(result.calorias_totales).toBe(1900);
      expect(result.activa).toBe(true);
    });
  });

  describe('deletePlanificacion', () => {
    it('llama a DELETE /planificaciones/:id y devuelve response.data', async () => {
      mockDelete.mockResolvedValue({ data: null });
      const result = await planificacionesApi.deletePlanificacion('plan-1');
      expect(mockDelete).toHaveBeenCalledWith('/planificaciones/plan-1');
      expect(result).toBeNull();
    });
  });

  describe('setActivaPlanificacion', () => {
    it('llama a PATCH /planificaciones/:id/activa y devuelve response.data', async () => {
      const planActiva = { ...PLAN, activa: true };
      mockPatch.mockResolvedValue({ data: planActiva });
      const result = await planificacionesApi.setActivaPlanificacion('plan-1');
      expect(mockPatch).toHaveBeenCalledWith('/planificaciones/plan-1/activa');
      expect(result.activa).toBe(true);
    });
  });
});
