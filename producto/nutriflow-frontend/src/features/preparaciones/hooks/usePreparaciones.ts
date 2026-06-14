// nutriflow-frontend/src/features/preparaciones/hooks/usePreparaciones.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { preparacionesKeys } from '../../../shared/api/queryKeys';
import { preparacionesApi } from '../services/preparacionesApi';
import type {
  CreatePreparacionPayload,
  UpdatePreparacionPayload,
} from '../types/preparacion.types';

/** Preparaciones propias del nutricionista + las del sistema. */
export const usePreparaciones = () => {
  return useQuery({
    queryKey: preparacionesKeys.all,
    queryFn: preparacionesApi.listar,
    staleTime: 1000 * 60 * 5, // 5 min: el catálogo cambia poco
  });
};

export const useCrearPreparacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePreparacionPayload) => preparacionesApi.crear(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: preparacionesKeys.all });
    },
  });
};

export const useActualizarPreparacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePreparacionPayload }) =>
      preparacionesApi.actualizar(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: preparacionesKeys.all });
    },
  });
};

export const useEliminarPreparacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => preparacionesApi.eliminar(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: preparacionesKeys.all });
    },
  });
};
