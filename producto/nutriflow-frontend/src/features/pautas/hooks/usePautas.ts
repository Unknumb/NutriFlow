import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pautasApi } from '../services/pautasApi';
import { pacientesKeys, pautasKeys } from '../../../shared/api/queryKeys';
import type { CreatePautaPayload, UpdatePautaPayload } from '../types/pauta.types';

export const usePautas = () => {
  return useQuery({
    queryKey: pautasKeys.all,
    queryFn: pautasApi.fetchPautas,
  });
};

export const usePauta = (id: string | undefined) => {
  return useQuery({
    queryKey: pautasKeys.detail(id!),
    queryFn: () => pautasApi.fetchPauta(id!),
    enabled: !!id,
  });
};

export const useCreatePauta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePautaPayload) => pautasApi.createPauta(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: pautasKeys.all });
      queryClient.invalidateQueries({ queryKey: pacientesKeys.pautas(data.paciente_id) });
    },
  });
};

export const useUpdatePauta = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePautaPayload) => pautasApi.updatePauta(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: pautasKeys.all });
      queryClient.invalidateQueries({ queryKey: pautasKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: pacientesKeys.pautas(data.paciente_id) });
    },
  });
};

export const useDeletePauta = (pacienteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pautasApi.deletePauta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pautasKeys.all });
      queryClient.invalidateQueries({ queryKey: pacientesKeys.pautas(pacienteId) });
    },
  });
};
