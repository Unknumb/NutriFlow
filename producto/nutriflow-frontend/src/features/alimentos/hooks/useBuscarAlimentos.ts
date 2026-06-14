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
  offset?: number;
  /** Si es true, consulta también sin texto ni categoría (modo navegación/gestión). */
  permitirSinFiltro?: boolean;
}

/**
 * Búsqueda server-side de alimentos (debounce a cargo del consumidor).
 * Por defecto solo consulta cuando hay texto o categoría (evita descargar todo el
 * catálogo desde el modal de preparaciones). En la gestión del catálogo se usa
 * `permitirSinFiltro` para navegar todo paginado.
 */
export const useBuscarAlimentos = ({
  search,
  categoria,
  enabled = true,
  limit = 20,
  offset = 0,
  permitirSinFiltro = false,
}: UseBuscarAlimentosOptions) => {
  const termino = search.trim();
  const hayFiltro = termino.length > 0 || !!categoria;

  return useQuery({
    queryKey: [...alimentosKeys.busqueda(termino, categoria), limit, offset],
    queryFn: () =>
      alimentosApi.buscar({
        search: termino || undefined,
        categoria: categoria ?? undefined,
        limit,
        offset,
      }),
    enabled: enabled && (hayFiltro || permitirSinFiltro),
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
