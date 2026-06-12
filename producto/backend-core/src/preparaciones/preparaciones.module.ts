// backend-core/src/preparaciones/preparaciones.module.ts
import { Module } from '@nestjs/common';
import { PreparacionesController } from './preparaciones.controller';
import { PreparacionesService } from './preparaciones.service';

@Module({
  controllers: [PreparacionesController],
  providers: [PreparacionesService],
})
export class PreparacionesModule {}
