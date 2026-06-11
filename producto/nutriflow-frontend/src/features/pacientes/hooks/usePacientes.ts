import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pacientesApi } from '../services/pacientesApi';
import { pacientesKeys } from '../../../shared/api/queryKeys';
import type { UpdatePacientePayload } from '../types/paciente.types';

export const usePacientes = () => {
  return useQuery({
    queryKey: pacientesKeys.all,
    queryFn: pacientesApi.fetchPacientes,
  });
};

export const usePaciente = (id: string) => {
  return useQuery({
    queryKey: pacientesKeys.detail(id),
    queryFn: () => pacientesApi.fetchPaciente(id),
    enabled: !!id,
  });
};

export const useCreatePaciente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: pacientesApi.createPaciente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pacientesKeys.all });
    },
  });
};

export const useUpdatePaciente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePacientePayload }) =>
      pacientesApi.updatePaciente(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pacientesKeys.all });
      queryClient.invalidateQueries({ queryKey: pacientesKeys.detail(variables.id) });
    },
  });
};

export const useDeletePaciente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pacientesApi.deletePaciente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pacientesKeys.all });
    },
  });
};
