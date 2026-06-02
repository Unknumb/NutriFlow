export interface PorcentajesMacros {
  proteina: number;
  grasa: number;
  carbohidratos: number;
}

export interface Pauta {
  id: string;
  paciente_id: string;
  nutricionista_id: string;
  fecha_creacion: string;
  calorias_totales: number;
  distribucion_macros: Record<string, any>;
  tiempos_comida: Record<string, any>;
  estructura_grid_json?: Record<string, any>;
}

export interface CreatePautaPayload {
  paciente_id: string;
  calorias_totales: number;
  porcentajes_macros: PorcentajesMacros;
  tiempos_comida: Record<string, any>;
}

export interface UpdatePautaPayload extends Partial<CreatePautaPayload> {}
