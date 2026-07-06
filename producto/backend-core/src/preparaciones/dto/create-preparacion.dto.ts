// backend-core/src/preparaciones/dto/create-preparacion.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

/** Vocabulario controlado de tiempos de comida (CHECK en DB). */
export const TIPOS_COMIDA = [
  'desayuno',
  'almuerzo',
  'cena',
  'colacion',
] as const;
export type TipoComida = (typeof TIPOS_COMIDA)[number];

export class IngredientePreparacionDto {
  @ApiProperty({
    description: 'ID del alimento (tabla alimentos)',
    format: 'uuid',
  })
  @IsUUID()
  alimento_id: string;

  @ApiProperty({ description: 'Cantidad en gramos', example: 100 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  cantidad_g: number;
}

export class CreatePreparacionDto {
  @ApiProperty({
    description: 'Nombre de la preparación',
    example: 'Avena con manzana y almendras',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción breve' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Instrucciones de preparación' })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  instrucciones?: string;

  @ApiPropertyOptional({ description: 'Tiempo de comida', enum: TIPOS_COMIDA })
  @IsIn(TIPOS_COMIDA)
  @IsOptional()
  tipo_comida?: TipoComida;

  @ApiPropertyOptional({
    description: 'URL pública de la imagen (bucket imagenes_preparaciones)',
  })
  @IsUrl(
    { protocols: ['https'], require_protocol: true },
    { message: 'imagen_url debe ser una URL https válida' },
  )
  @MaxLength(500)
  @IsOptional()
  imagen_url?: string;

  @ApiProperty({
    description: 'Ingredientes de la preparación',
    type: [IngredientePreparacionDto],
  })
  @IsArray()
  @ArrayMinSize(1, {
    message: 'La preparación debe tener al menos un ingrediente',
  })
  @ValidateNested({ each: true })
  @Type(() => IngredientePreparacionDto)
  ingredientes: IngredientePreparacionDto[];
}
