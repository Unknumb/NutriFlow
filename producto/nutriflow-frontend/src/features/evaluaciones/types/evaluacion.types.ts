export interface Evaluacion {
  id: string;
  paciente_id: string;
  nutricionista_id: string;
  fecha_evaluacion: string;
  peso_actual: number;
  talla_cm: number;
  nivel_actividad_fisica: string;
  objetivo: string;
  tmb?: number;
  gasto_energetico_total?: number;
}

export interface CreateEvaluacionPayload {
  paciente_id: string;
  peso_actual: number;
  talla_cm: number;
  nivel_actividad_fisica: string;
  objetivo: string;
}

export interface EvaluacionConCalculos extends Evaluacion {
  calculos?: {
    tmb: Record<string, number>;
    gasto_energetico_total: number;
  };
}

// Respuesta del POST /evaluaciones — el backend devuelve la evaluación
// persistida junto al desglose de cálculos del motor matemático.
export interface CreateEvaluacionResponse {
  evaluacion: Evaluacion;
  calculos: {
    tmb: Record<string, number>;
    gasto_energetico_total: number;
  };
}
