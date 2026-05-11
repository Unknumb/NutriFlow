import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID } from 'class-validator';

export class CreateEvaluacionDto {
  @ApiProperty({ description: 'ID del paciente', example: 'uuid-del-paciente' })
  @IsUUID()
  paciente_id: string;

  @ApiProperty({ description: 'Peso actual en kg', example: 70.5 })
  @IsNumber()
  peso_actual: number;

  @ApiProperty({ description: 'Talla en cm', example: 175 })
  @IsNumber()
  talla_cm: number;

  @ApiProperty({ description: 'Nivel de actividad física', example: 'Moderado' })
  @IsString()
  nivel_actividad_fisica: string;

  @ApiProperty({ description: 'Objetivo nutricional', example: 'Déficit' })
  @IsString()
  objetivo: string;
}
