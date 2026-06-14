// nutriflow-frontend/src/features/preparaciones/types/preparacion.types.ts

/** Vocabulario controlado de tiempos de comida (CHECK en DB / DTO de backend-core). */
export type TipoComida = 'desayuno' | 'almuerzo' | 'cena' | 'colacion';

export const TIPO_COMIDA_LABELS: Record<TipoComida, string> = {
  desayuno: 'Desayuno',
  almuerzo: 'Almuerzo',
  cena: 'Cena',
  colacion: 'Colación',
};

export interface IngredienteDePreparacion {
  id: string;
  alimento_id: string;
  nombre: string;
  marca: string | null;
  categoria: string | null;
  cantidad_g: number;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

export interface TotalesNutricionales {
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

export interface Preparacion {
  id: string;
  nombre: string;
  descripcion: string | null;
  instrucciones: string | null;
  tipo_comida: TipoComida | null;
  /** Imagen de la preparación (la subida se habilita en Fase 3). */
  imagen_url: string | null;
  fecha_creacion: string | null;
  /** true = preparación del sistema (solo lectura, visible para todos). */
  es_sistema: boolean;
  ingredientes: IngredienteDePreparacion[];
  totales: TotalesNutricionales;
}

export interface IngredientePayload {
  alimento_id: string;
  cantidad_g: number;
}

export interface CreatePreparacionPayload {
  nombre: string;
  descripcion?: string;
  instrucciones?: string;
  tipo_comida?: TipoComida;
  imagen_url?: string;
  ingredientes: IngredientePayload[];
}

/** En PATCH, `imagen_url: null` quita la imagen (el backend lo persiste como NULL). */
export type UpdatePreparacionPayload = Partial<Omit<CreatePreparacionPayload, 'imagen_url'>> & {
  imagen_url?: string | null;
};
