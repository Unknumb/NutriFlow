// nutriflow-frontend/src/features/alimentos/services/alimentosApi.ts
import { apiClient } from '../../../shared/api/apiClient';
import type {
  Alimento,
  BuscarAlimentosParams,
  BusquedaAlimentosResponse,
  CreateAlimentoPayload,
} from '../types/alimento.types';

export const alimentosApi = {
  /** Búsqueda server-side (insensible a acentos), con filtro de categoría y paginación. */
  buscar: async (params: BuscarAlimentosParams): Promise<BusquedaAlimentosResponse> => {
    const { data } = await apiClient.get<BusquedaAlimentosResponse>('/alimentos', { params });
    return data;
  },

  /** Categorías distintas del catálogo (vocabulario controlado). */
  categorias: async (): Promise<string[]> => {
    const { data } = await apiClient.get<string[]>('/alimentos/categorias');
    return data;
  },

  /** Crea un alimento nuevo. El backend responde 409 si ya existe (nombre, marca). */
  crear: async (payload: CreateAlimentoPayload): Promise<Alimento> => {
    const { data } = await apiClient.post<Alimento>('/alimentos', payload);
    return data;
  },
};
