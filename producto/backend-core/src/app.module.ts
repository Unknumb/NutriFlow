import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { validateEnv } from './config/env.validation';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { AuthModule } from './auth/auth.module';
import { PautasModule } from './pautas/pautas.module';
import { EvaluacionesModule } from './evaluaciones/evaluaciones.module';
import { CalculosModule } from './calculos/calculos.module';
import { MenusModule } from './menus/menus.module';
import { PlanificacionesModule } from './planificaciones/planificaciones.module';
import { PreparacionesModule } from './preparaciones/preparaciones.module';
import { AlimentosModule } from './alimentos/alimentos.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // validate: valida los secretos al arrancar y falla rápido si falta alguno.
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    // Límite global de peticiones: 100 req/min por IP como defensa base ante
    // abuso/fuerza bruta. Rutas sensibles (login) aplican un límite más estricto
    // con @Throttle. Complementa el rate-limit del endpoint JWKS en jwt.strategy.ts.
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    PacientesModule,
    AuthModule,
    PautasModule,
    EvaluacionesModule,
    CalculosModule,
    MenusModule,
    PlanificacionesModule,
    PreparacionesModule,
    AlimentosModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    // Activa el rate limiting de forma global para todas las rutas.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
