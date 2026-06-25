import { apiClient } from '../../../shared/api/apiClient';
import type { CreateEvaluacionPayload, UpdateEvaluacionPayload, EvaluacionConCalculos, CreateEvaluacionResponse } from '../types/evaluacion.types';

export const evaluacionesApi = {
  fetchEvaluacionesByPaciente: async (pacienteId: string): Promise<EvaluacionConCalculos[]> => {
    const { data } = await apiClient.get(`/evaluaciones/paciente/${pacienteId}`);
    return data;
  },

  fetchEvaluacion: async (id: string): Promise<EvaluacionConCalculos> => {
    const { data } = await apiClient.get(`/evaluaciones/${id}`);
    return data;
  },

  createEvaluacion: async (payload: CreateEvaluacionPayload): Promise<CreateEvaluacionResponse> => {
    const { data } = await apiClient.post('/evaluaciones', payload);
    return data;
  },

  updateEvaluacion: async (id: string, payload: Partial<UpdateEvaluacionPayload>): Promise<EvaluacionConCalculos> => {
    const { data } = await apiClient.patch(`/evaluaciones/${id}`, payload);
    return data;
  },

  deleteEvaluacion: async (id: string): Promise<void> => {
    await apiClient.delete(`/evaluaciones/${id}`);
  },
};
