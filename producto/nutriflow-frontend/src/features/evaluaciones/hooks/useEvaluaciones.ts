import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesApi } from '../services/evaluacionesApi';
import { pacientesKeys } from '../../../shared/api/queryKeys';
import type { CreateEvaluacionPayload, UpdateEvaluacionPayload } from '../types/evaluacion.types';

export const useUpdateEvaluacion = (pacienteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UpdateEvaluacionPayload> }) =>
      evaluacionesApi.updateEvaluacion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pacientesKeys.evaluaciones(pacienteId),
      });
    },
  });
};

export const useEvaluacionesByPaciente = (pacienteId: string | undefined) => {
  return useQuery({
    queryKey: pacienteId ? pacientesKeys.evaluaciones(pacienteId) : [],
    queryFn: () => evaluacionesApi.fetchEvaluacionesByPaciente(pacienteId!),
    enabled: !!pacienteId,
  });
};

export const useCreateEvaluacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEvaluacionPayload) => evaluacionesApi.createEvaluacion(payload),
    onSuccess: (data) => {
      // Invalidar historial del paciente — el backend devuelve { evaluacion, calculos }
      queryClient.invalidateQueries({
        queryKey: pacientesKeys.evaluaciones(data.evaluacion.paciente_id),
      });
    },
  });
};

export const useDeleteEvaluacion = (pacienteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: evaluacionesApi.deleteEvaluacion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pacientesKeys.evaluaciones(pacienteId),
      });
    },
  });
};
