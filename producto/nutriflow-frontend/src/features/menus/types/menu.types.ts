export interface GenerarMenuPayload {
  porciones_disponibles: Record<string, number>;
  alimentos_rechazados?: string[];
}

export interface RecetaOut {
  id: number;
  nombre: string;
  ingredientes: string[];
  porciones_requeridas: Record<string, number>;
}

export interface GenerarMenuResponse {
  matches_exactos: RecetaOut[];
  matches_parciales: RecetaOut[];
}
