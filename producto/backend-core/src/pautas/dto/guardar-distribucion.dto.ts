import { IsString, IsObject, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class GuardarDistribucionDto {
  @IsString()
  @IsNotEmpty()
  paciente_id: string;

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
}
