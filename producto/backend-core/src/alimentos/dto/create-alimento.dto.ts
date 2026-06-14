// backend-core/src/alimentos/dto/create-alimento.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAlimentoDto {
  @ApiProperty({ description: 'Nombre del alimento', example: 'Quinoa cocida' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @ApiPropertyOptional({ description: 'Marca comercial (opcional)', example: 'Genérico' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  marca?: string;

  @ApiPropertyOptional({
    description: 'Categoría: debe ser una de las existentes (GET /alimentos/categorias)',
    example: 'Cereales',
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  categoria?: string;

  @ApiProperty({ description: 'Calorías por 100 g', example: 120 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  calorias_100g: number;

  @ApiProperty({ description: 'Proteínas (g) por 100 g', example: 4.4 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  proteinas_100g: number;

  @ApiProperty({ description: 'Carbohidratos (g) por 100 g', example: 21.3 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  carbohidratos_100g: number;

  @ApiProperty({ description: 'Grasas (g) por 100 g', example: 1.9 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  grasas_100g: number;

  @ApiPropertyOptional({
    description: 'Restricciones dietéticas asociadas (ej. "gluten", "lactosa")',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  @IsOptional()
  restricciones?: string[];
}
