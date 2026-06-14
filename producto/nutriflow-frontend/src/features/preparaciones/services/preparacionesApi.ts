// nutriflow-frontend/src/features/preparaciones/services/preparacionesApi.ts
import { apiClient } from '../../../shared/api/apiClient';
import type {
  CreatePreparacionPayload,
  Preparacion,
  UpdatePreparacionPayload,
} from '../types/preparacion.types';

export const preparacionesApi = {
  listar: async (): Promise<Preparacion[]> => {
    const { data } = await apiClient.get<Preparacion[]>('/preparaciones');
    return data;
  },

  crear: async (payload: CreatePreparacionPayload): Promise<Preparacion> => {
    const { data } = await apiClient.post<Preparacion>('/preparaciones', payload);
    return data;
  },

  actualizar: async (id: string, payload: UpdatePreparacionPayload): Promise<Preparacion> => {
    const { data } = await apiClient.patch<Preparacion>(`/preparaciones/${id}`, payload);
    return data;
  },

  eliminar: async (id: string): Promise<void> => {
    await apiClient.delete(`/preparaciones/${id}`);
  },
};
