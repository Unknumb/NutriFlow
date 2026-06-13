// nutriflow-frontend/src/features/alimentos/hooks/useBuscarAlimentos.ts
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { alimentosKeys } from '../../../shared/api/queryKeys';
import { alimentosApi } from '../services/alimentosApi';
import type { CreateAlimentoPayload } from '../types/alimento.types';

interface UseBuscarAlimentosOptions {
  search: string;
  categoria: string | null;
  /** Permite deshabilitar la query (ej. modal cerrado). */
  enabled?: boolean;
  limit?: number;
}

/**
 * Búsqueda server-side de alimentos (debounce a cargo del consumidor).
 * Solo consulta cuando hay texto o categoría: evita descargar el catálogo completo.
 * `keepPreviousData` mantiene los resultados anteriores mientras llega la página nueva.
 */
export const useBuscarAlimentos = ({
  search,
  categoria,
  enabled = true,
  limit = 20,
}: UseBuscarAlimentosOptions) => {
  const termino = search.trim();
  const hayFiltro = termino.length > 0 || !!categoria;

  return useQuery({
    queryKey: alimentosKeys.busqueda(termino, categoria),
    queryFn: () =>
      alimentosApi.buscar({
        search: termino || undefined,
        categoria: categoria ?? undefined,
        limit,
      }),
    enabled: enabled && hayFiltro,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 min: el catálogo cambia poco dentro de una sesión
  });
};

/** Categorías del catálogo para filtros y formularios (cambian rara vez). */
export const useCategorias = (enabled = true) => {
  return useQuery({
    queryKey: alimentosKeys.categorias(),
    queryFn: alimentosApi.categorias,
    enabled,
    staleTime: 1000 * 60 * 30,
  });
};

/** Alta de alimento; invalida todas las búsquedas cacheadas al crear. */
export const useCrearAlimento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAlimentoPayload) => alimentosApi.crear(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: alimentosKeys.all });
    },
  });
};

/** Edición de alimento (incluye mover de categoría); invalida búsquedas. */
export const useActualizarAlimento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cambios }: { id: string; cambios: Partial<CreateAlimentoPayload> }) =>
      alimentosApi.actualizar(id, cambios),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: alimentosKeys.all });
    },
  });
};

/** Eliminación de alimento; invalida búsquedas. 409 si está en uso. */
export const useEliminarAlimento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alimentosApi.eliminar(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: alimentosKeys.all });
    },
  });
};
