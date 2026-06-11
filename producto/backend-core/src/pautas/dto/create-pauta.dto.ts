import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class PorcentajesMacrosDto {
  @ApiProperty({ example: 20 })
  @IsNumber()
  proteina: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  grasa: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  carbohidratos: number;
}

export class CreatePautaDto {
  @ApiProperty({ description: 'ID del paciente', example: 'uuid-del-paciente' })
  @IsUUID()
  @IsNotEmpty()
  paciente_id: string;

  @ApiProperty({ description: 'ID de la planificación de origen', example: 'uuid-de-planificacion' })
  @IsUUID()
  @IsNotEmpty()
  planificacion_id: string;

  @ApiPropertyOptional({ description: 'Nombre o descripción de la pauta', example: 'Día de entrenamiento' })
  @IsString()
  @IsOptional()
  descripcion_general?: string;

  @ApiProperty({ 
    description: 'Tiempos de comida y porciones distribuidas',
    example: { desayuno: { lacteos: 1, cereales: 2 } }
  })
  @IsObject()
  @IsNotEmpty()
  tiempos_comida: Record<string, any>;
}