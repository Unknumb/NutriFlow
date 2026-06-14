import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsNotEmpty, IsUUID, IsString, IsOptional } from 'class-validator';

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

export class CreatePlanificacionDto {
  @ApiProperty({ description: 'ID del paciente', example: 'uuid-del-paciente' })
  @IsUUID()
  @IsNotEmpty()
  paciente_id: string;

  @ApiProperty({ description: 'Nombre de la planificación. Si se omite, se autogenera "Planificación N".', required: false, example: 'Planificación 1' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ description: 'Calorías totales objetivo', example: 2000 })
  @IsNumber()
  @IsNotEmpty()
  calorias_totales: number;

  @ApiProperty({ 
    description: 'Porcentajes para el cálculo de macronutrientes',
    example: { proteina: 20, grasa: 30, carbohidratos: 50 } 
  })
  @IsObject()
  @IsNotEmpty()
  distribucion_macros: PorcentajesMacrosDto;
}
