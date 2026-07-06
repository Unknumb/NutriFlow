import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CalculosController } from './calculos.controller';
import { MathEngineService } from './math.engine.service';

@Module({
  // 🚨 IMPORTANTE: Necesitamos HttpModule para que el servicio pueda usar Axios
  imports: [HttpModule],
  controllers: [CalculosController],
  providers: [MathEngineService],
  // Exportamos el servicio por si otros módulos lo necesitan después
  exports: [MathEngineService],
})
export class CalculosModule {}
