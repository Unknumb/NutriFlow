import { apiClient } from '../../../shared/api/apiClient';
import type { Pauta, CreatePautaPayload, UpdatePautaPayload } from '../types/pauta.types';

export const pautasApi = {
  fetchPautas: async (): Promise<Pauta[]> => {
    const { data } = await apiClient.get('/pautas');
    return data;
  },

  fetchPauta: async (id: string): Promise<Pauta> => {
    const { data } = await apiClient.get(`/pautas/${id}`);
    return data;
  },

  createPauta: async (payload: CreatePautaPayload): Promise<Pauta> => {
    const { data } = await apiClient.post('/pautas', payload);
    return data;
  },

  updatePauta: async (id: string, payload: UpdatePautaPayload): Promise<Pauta> => {
    const { data } = await apiClient.patch(`/pautas/${id}`, payload);
    return data;
  },

  deletePauta: async (id: string): Promise<void> => {
    await apiClient.delete(`/pautas/${id}`);
  },
};
