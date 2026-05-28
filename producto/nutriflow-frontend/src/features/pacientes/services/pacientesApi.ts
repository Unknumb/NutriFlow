import { apiClient } from '../../../shared/api/apiClient';
import type { Paciente, CreatePacientePayload, UpdatePacientePayload } from '../types/paciente.types';

export const pacientesApi = {
  fetchPacientes: async (): Promise<Paciente[]> => {
    const { data } = await apiClient.get('/pacientes');
    return data;
  },

  fetchPaciente: async (id: string): Promise<Paciente> => {
    const { data } = await apiClient.get(`/pacientes/${id}`);
    return data;
  },

  createPaciente: async (payload: CreatePacientePayload): Promise<Paciente> => {
    const { data } = await apiClient.post('/pacientes', payload);
    return data;
  },

  updatePaciente: async (id: string, payload: UpdatePacientePayload): Promise<Paciente> => {
    const { data } = await apiClient.patch(`/pacientes/${id}`, payload);
    return data;
  },

  deletePaciente: async (id: string): Promise<void> => {
    await apiClient.delete(`/pacientes/${id}`);
  },
};
