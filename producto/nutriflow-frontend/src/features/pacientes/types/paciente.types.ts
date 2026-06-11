export interface Paciente {
  id: string;
  nutricionista_id: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string; // ISO string Date
  sexo_biologico?: string;
  email?: string;
  telefono?: string;
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
  talla_cm: number;
  peso_kg: number;
}

export interface UpdatePacientePayload extends Partial<CreatePacientePayload> {}
