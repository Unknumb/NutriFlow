// nutriflow-frontend/src/features/alimentos/types/alimento.types.ts

/** Alimento del catálogo, tal como lo devuelve backend-core (GET/POST /alimentos). */
export interface Alimento {
  id: string;
  nombre: string;
  marca: string | null;
  categoria: string | null;
  calorias_100g: number;
  proteinas_100g: number;
  carbohidratos_100g: number;
  grasas_100g: number;
  restricciones: string[];
}

/** Respuesta paginada de GET /alimentos. */
export interface BusquedaAlimentosResponse {
  items: Alimento[];
  total: number;
  limit: number;
  offset: number;
}

export interface BuscarAlimentosParams {
  search?: string;
  categoria?: string;
  limit?: number;
  offset?: number;
}

/** Payload de POST /alimentos (valores nutricionales por 100 g). */
export interface CreateAlimentoPayload {
  nombre: string;
  marca?: string;
  categoria?: string;
  calorias_100g: number;
  proteinas_100g: number;
  carbohidratos_100g: number;
  grasas_100g: number;
  restricciones?: string[];
}
