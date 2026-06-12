// backend-core/src/alimentos/dto/query-alimentos.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class QueryAlimentosDto {
  @ApiPropertyOptional({ description: 'Texto a buscar en el nombre (insensible a acentos y mayúsculas)' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por categoría exacta (ver GET /alimentos/categorias)' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  categoria?: string;

  @ApiPropertyOptional({ description: 'Tamaño de página', default: 20, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Desplazamiento para paginación', default: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number = 0;
}
