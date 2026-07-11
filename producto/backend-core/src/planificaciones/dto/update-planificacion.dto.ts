import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { PorcentajesMacrosDto } from './create-planificacion.dto';

/**
 * Sobrescritura de una planificación existente. Todos los campos son
 * opcionales: solo se actualiza lo enviado. El paciente dueño no se puede
 * cambiar (la planificación queda ligada a su paciente original).
 */
export class UpdatePlanificacionDto {
  @ApiProperty({
    description: 'Nuevo nombre de la planificación',
    required: false,
    example: 'Planificación 1',
  })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({
    description: 'Calorías totales objetivo',
    required: false,
    example: 2000,
  })
  @IsNumber()
  @IsOptional()
  calorias_totales?: number;

  @ApiProperty({
    description: 'Porcentajes para el cálculo de macronutrientes',
    required: false,
    example: { proteina: 20, grasa: 30, carbohidratos: 50 },
  })
  @IsObject()
  @IsOptional()
  distribucion_macros?: PorcentajesMacrosDto;
}
