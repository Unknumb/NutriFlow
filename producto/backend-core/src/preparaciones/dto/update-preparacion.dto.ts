// backend-core/src/preparaciones/dto/update-preparacion.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreatePreparacionDto } from './create-preparacion.dto';

/**
 * Todos los campos son opcionales. Si se envía `ingredientes`,
 * se reemplaza la lista completa (delete + create en transacción).
 */
export class UpdatePreparacionDto extends PartialType(CreatePreparacionDto) {}
