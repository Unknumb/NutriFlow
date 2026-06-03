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
  descripcion_general?: string;
  planificacion_id?: string;
  tiempos_comida: Record<string, any>;
  estructura_grid_json?: Record<string, any>;
}

export interface CreatePautaPayload {
  paciente_id: string;
  planificacion_id: string;
  descripcion_general?: string;
  tiempos_comida: Record<string, any>;
}

export interface UpdatePautaPayload extends Partial<CreatePautaPayload> {}
