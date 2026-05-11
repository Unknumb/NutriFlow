import { PartialType } from '@nestjs/swagger';
import { CreatePautaDto } from './create-pauta.dto';

export class UpdatePautaDto extends PartialType(CreatePautaDto) {}
