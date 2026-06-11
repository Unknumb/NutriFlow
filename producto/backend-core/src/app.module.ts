import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { AuthModule } from './auth/auth.module';
import { PautasModule } from './pautas/pautas.module';
import { EvaluacionesModule } from './evaluaciones/evaluaciones.module';
import { CalculosModule } from './calculos/calculos.module';
import { MenusModule } from './menus/menus.module';
import { PlanificacionesModule } from './planificaciones/planificaciones.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, 
    PacientesModule, 
    AuthModule, 
    PautasModule,
    EvaluacionesModule,
    CalculosModule,
    MenusModule,
    PlanificacionesModule,
    RedisModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
