// nutriflow-frontend/src/features/menus/types/menu.types.ts
import type { TipoComida } from '../../preparaciones/types/preparacion.types';

/** Espejo de GenerarMenuDto en backend-core (src/menus/dto/generar-menu.dto.ts). */
export interface GenerarMenuPayload {
  porciones_disponibles: Record<string, number>;
  /** Tiempo de comida para el que se genera; omitir = sin filtro. */
  tipo_comida?: TipoComida;
  paciente_id?: string;
  /** Vocabulario controlado: ver features/generador/constants/restricciones.ts */
  restricciones_dieteticas?: string[];
  alimentos_rechazados?: string[];
}

/** Espejo de IngredienteOut en backend-math (schemas/menus.py). */
export interface IngredienteOut {
  nombre: string;
  marca?: string | null;
  cantidad_g: number;
  /** True si el alimento no tiene tags de restricción (el filtrado no pudo evaluarlo). */
  sin_etiquetar?: boolean;
}

/** Espejo de RecetaOut en backend-math (schemas/menus.py). */
export interface RecetaOut {
  id: string;
  nombre: string;
  descripcion?: string | null;
  instrucciones?: string | null;
  tipo_comida?: TipoComida | null;
  imagen_url?: string | null;
  calorias_totales: number;
  /** % de las porciones disponibles de la comida que la receta utiliza (0-100). */
  cobertura: number;
  ingredientes: IngredienteOut[];
  porciones_requeridas: Record<string, number>;
}

export interface GenerarMenuResponse {
  matches_exactos: RecetaOut[];
  matches_parciales: RecetaOut[];
}
