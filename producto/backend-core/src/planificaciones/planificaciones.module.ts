import { Module } from '@nestjs/common';
import { PlanificacionesController } from './planificaciones.controller';
import { PlanificacionesService } from './planificaciones.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlanificacionesController],
  providers: [PlanificacionesService],
})
export class PlanificacionesModule {}
