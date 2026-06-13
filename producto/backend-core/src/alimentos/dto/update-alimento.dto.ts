// backend-core/src/alimentos/dto/update-alimento.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateAlimentoDto } from './create-alimento.dto';

/**
 * Actualización parcial de un alimento del catálogo (incluye mover de categoría).
 * Todos los campos son opcionales; solo se actualizan los enviados.
 */
export class UpdateAlimentoDto extends PartialType(CreateAlimentoDto) {}
