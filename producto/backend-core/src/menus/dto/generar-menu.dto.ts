import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsArray, IsString, IsOptional } from 'class-validator';

export class GenerarMenuDto {
  @ApiProperty({
    description: 'Objeto con las porciones disponibles agrupadas por grupo de alimento',
    example: {
      cereales_papas_legumbres_frescas: 1.5,
      verduras_general: 2.0,
      frutas: 1.0,
    },
  })
  @IsObject()
  porciones_disponibles: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Lista de alimentos rechazados por el paciente (por nombre o ID)',
    type: [String],
    example: ['tomate', 'cebolla'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alimentos_rechazados?: string[];
}
