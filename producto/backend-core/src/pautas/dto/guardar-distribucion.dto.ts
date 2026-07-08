import {
  IsString,
  IsObject,
  IsNotEmpty,
  IsArray,
  IsOptional,
} from 'class-validator';

export class GuardarDistribucionDto {
  @IsString()
  @IsNotEmpty()
  paciente_id: string;

  /** Planificación de macros a la que pertenece la pauta. Obligatorio: no se
   *  puede guardar una pauta sin una planificación asignada. */
  @IsString()
  @IsNotEmpty()
  planificacion_id: string;

  /** Si viene, se actualiza esa pauta; si no, se crea una nueva. */
  @IsString()
  @IsOptional()
  pauta_id?: string;

  /** Nombre de la pauta. Si se omite al crear, se autogenera "Pauta N". */
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsObject()
  distributions: Record<string, Record<string, number>>;

  @IsObject()
  targets: Record<string, number>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  activeMeals?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  activeGroups?: string[];

  /** Grupos marcados como libre consumo (ad libitum). */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  libreConsumoIds?: string[];

  /** Tiempos de comida personalizados ({id, name, time}). */
  @IsArray()
  @IsOptional()
  customMeals?: { id: string; name: string; time: string }[];

  /** Override de horario por comida. */
  @IsObject()
  @IsOptional()
  mealTimes?: Record<string, string>;

  /** Sugerencias del generador ancladas por tiempo de comida
   *  ({ almuerzo: [{id, nombre, ingredientes}] }). Se muestran como
   *  ejemplos de preparación en la pauta. */
  @IsObject()
  @IsOptional()
  sugerenciasComida?: Record<
    string,
    { id: string; nombre: string; ingredientes: string }[]
  >;
}
