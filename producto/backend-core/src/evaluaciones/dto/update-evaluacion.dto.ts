import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateEvaluacionDto } from './create-evaluacion.dto';

export class UpdateEvaluacionDto extends PartialType(CreateEvaluacionDto) {
  @ApiPropertyOptional({ description: 'TMB estimada en kcal', example: 1650 })
  @IsOptional()
  @IsNumber()
  tmb?: number;

  @ApiPropertyOptional({
    description: 'Gasto energético total en kcal',
    example: 2200,
  })
  @IsOptional()
  @IsNumber()
  gasto_energetico_total?: number;
}
