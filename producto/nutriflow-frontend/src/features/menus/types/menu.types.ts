// nutriflow-frontend/src/features/menus/types/menu.types.ts

/** Espejo de GenerarMenuDto en backend-core (src/menus/dto/generar-menu.dto.ts). */
export interface GenerarMenuPayload {
  porciones_disponibles: Record<string, number>;
  paciente_id?: string;
  /** Vocabulario controlado: ver features/generador/constants/restricciones.ts */
  restricciones_dieteticas?: string[];
  alimentos_rechazados?: string[];
  preferencias_texto?: string;
}

/** Espejo de IngredienteOut en backend-math (schemas/menus.py). */
export interface IngredienteOut {
  nombre: string;
  marca?: string | null;
  cantidad_g: number;
}

/** Espejo de RecetaOut en backend-math (schemas/menus.py). */
export interface RecetaOut {
  id: string;
  nombre: string;
  descripcion?: string | null;
  instrucciones?: string | null;
  ingredientes: IngredienteOut[];
  porciones_requeridas: Record<string, number>;
}

export interface GenerarMenuResponse {
  matches_exactos: RecetaOut[];
  matches_parciales: RecetaOut[];
}
