// backend-core/src/menus/dto/generar-menu.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsObject,
  IsArray,
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
} from 'class-validator';
import {
  RESTRICCIONES_DIETETICAS,
  RestriccionDietetica,
} from '../restricciones.constants';

export class GenerarMenuDto {
  @ApiProperty({
    description:
      'Objeto con las porciones disponibles agrupadas por grupo de alimento',
    example: {
      cereales_papas_legumbres_frescas: 1.5,
      verduras_general: 2.0,
      frutas: 1.0,
    },
  })
  @IsObject()
  porciones_disponibles: Record<string, number>;

  @ApiPropertyOptional({
    description:
      'Tiempo de comida para el que se genera. Filtra preparaciones de otro ' +
      'tiempo (las sin clasificar no se excluyen). Omitir = sin filtro.',
    enum: ['desayuno', 'almuerzo', 'cena', 'colacion'],
  })
  @IsOptional()
  @IsIn(['desayuno', 'almuerzo', 'cena', 'colacion'])
  tipo_comida?: 'desayuno' | 'almuerzo' | 'cena' | 'colacion';

  @ApiPropertyOptional({
    description:
      'Paciente al que se asocia la generación. Si viene y no se envían ' +
      'restricciones explícitas, se derivan de su ficha (alergias y preferencias).',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  paciente_id?: string;

  @ApiPropertyOptional({
    description: 'Restricciones dietéticas del vocabulario controlado',
    enum: RESTRICCIONES_DIETETICAS,
    isArray: true,
    example: ['sin_gluten', 'vegetariano'],
  })
  @IsOptional()
  @IsArray()
  @IsIn(RESTRICCIONES_DIETETICAS, { each: true })
  restricciones_dieteticas?: RestriccionDietetica[];

  @ApiPropertyOptional({
    description:
      'Alimentos rechazados por nombre (match por palabra completa en backend-math)',
    type: [String],
    example: ['tomate', 'cebolla'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alimentos_rechazados?: string[];
}
