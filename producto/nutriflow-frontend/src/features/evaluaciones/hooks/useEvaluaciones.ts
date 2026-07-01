import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { evaluacionesApi } from '../services/evaluacionesApi';
import { pacientesKeys, dashboardKeys } from '../../../shared/api/queryKeys';
import { notify } from '../../../shared/store/useToastStore';
import type { CreateEvaluacionPayload, UpdateEvaluacionPayload } from '../types/evaluacion.types';

/**
 * Una nueva evaluación cambia peso/talla, que se muestran en varios lugares
 * derivados del query de pacientes (chip de la lista, card "Datos Personales")
 * y del dashboard (IMC/pesos de referencia). Por eso se invalida el historial
 * del paciente Y la lista de pacientes Y el dashboard, no solo el historial.
 */
const invalidarTrasEvaluacion = (queryClient: QueryClient, pacienteId: string) => {
  queryClient.invalidateQueries({ queryKey: pacientesKeys.evaluaciones(pacienteId) });
  queryClient.invalidateQueries({ queryKey: pacientesKeys.all });
  queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
};

export const useUpdateEvaluacion = (pacienteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UpdateEvaluacionPayload> }) =>
      evaluacionesApi.updateEvaluacion(id, payload),
    onSuccess: () => {
      invalidarTrasEvaluacion(queryClient, pacienteId);
      notify('success', 'Evaluación actualizada.');
    },
    onError: () => {
      notify('error', 'No se pudo actualizar la evaluación. Intenta nuevamente.');
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
      // El backend devuelve { evaluacion, calculos }
      invalidarTrasEvaluacion(queryClient, data.evaluacion.paciente_id);
      notify('success', 'Evaluación registrada.');
    },
    onError: () => {
      notify('error', 'No se pudo registrar la evaluación. Intenta nuevamente.');
    },
  });
};

export const useDeleteEvaluacion = (pacienteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: evaluacionesApi.deleteEvaluacion,
    onSuccess: () => {
      invalidarTrasEvaluacion(queryClient, pacienteId);
      notify('success', 'Evaluación eliminada.');
    },
    onError: () => {
      notify('error', 'No se pudo eliminar la evaluación. Intenta nuevamente.');
    },
  });
};
