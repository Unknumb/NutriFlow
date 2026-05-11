import { PartialType } from '@nestjs/swagger';
import { CreateEvaluacionDto } from './create-evaluacion.dto';

export class UpdateEvaluacionDto extends PartialType(CreateEvaluacionDto) {}
