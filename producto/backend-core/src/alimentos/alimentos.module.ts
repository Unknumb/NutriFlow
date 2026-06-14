// backend-core/src/alimentos/alimentos.module.ts
import { Module } from '@nestjs/common';
import { AlimentosController } from './alimentos.controller';
import { AlimentosService } from './alimentos.service';

@Module({
  controllers: [AlimentosController],
  providers: [AlimentosService],
})
export class AlimentosModule {}
