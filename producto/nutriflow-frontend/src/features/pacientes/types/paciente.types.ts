// nutriflow-frontend/src/features/pacientes/types/paciente.types.ts
export interface Paciente {
  id: string;
  nutricionista_id: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string; // ISO string Date
  sexo_biologico?: string;
  email?: string;
  telefono?: string;
  rut?: string; // Normalizado "12345678-9"
  ocupacion?: string;
  direccion?: string;
  enfermedades: string[];
  alergias: string[];
  preferencias_alimentarias: string[];
  notas_preferencias?: string;
  fecha_creacion: string; // ISO string DateTime
  Evaluacion?: Array<{
    peso_actual: number;
    talla_cm: number;
  }>;
}

export interface CreatePacientePayload {
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  sexo_biologico?: string;
  email?: string;
  telefono?: string;
  rut?: string;
  ocupacion?: string;
  direccion?: string;
  enfermedades?: string[];
  alergias?: string[];
  preferencias_alimentarias?: string[];
  notas_preferencias?: string;
  talla_cm: number;
  peso_kg: number;
}

/**
 * En updates se permite `null` para limpiar un campo opcional
 * (el backend interpreta null como "borrar valor" y undefined como "no tocar").
 */
export type UpdatePacientePayload = {
  [K in keyof CreatePacientePayload]?: CreatePacientePayload[K] | null;
};
