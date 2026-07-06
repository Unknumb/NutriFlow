import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

import { CreatePlanificacionDto } from './dto/create-planificacion.dto';

@Injectable()
export class PlanificacionesService {
  private readonly logger = new Logger(PlanificacionesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async create(createPlanificacionDto: CreatePlanificacionDto, userId: string) {
    try {
      // Si no se envía nombre, autosugerir "Planificación N" según las que ya
      // tiene el paciente (no global del nutricionista).
      let nombre = createPlanificacionDto.nombre?.trim();
      if (!nombre) {
        const existentes = await this.prisma.planificacion.count({
          where: {
            paciente_id: createPlanificacionDto.paciente_id,
            nutricionista_id: userId,
          },
        });
        nombre = `Planificación ${existentes + 1}`;
      }

      // La nueva planificación pasa a ser la activa del paciente; las demás se
      // desactivan en la misma transacción para respetar el índice único.
      const [, planificacion] = await this.prisma.$transaction([
        this.prisma.planificacion.updateMany({
          where: {
            paciente_id: createPlanificacionDto.paciente_id,
            nutricionista_id: userId,
            activa: true,
          },
          data: { activa: false },
        }),
        this.prisma.planificacion.create({
          data: {
            paciente_id: createPlanificacionDto.paciente_id,
            nutricionista_id: userId,
            nombre,
            activa: true,
            calorias_totales: createPlanificacionDto.calorias_totales,
            distribucion_macros:
              createPlanificacionDto.distribucion_macros as unknown as Prisma.InputJsonValue,
          },
        }),
      ]);

      await this.redisService.client.del(`planificaciones:${userId}`);

      return planificacion;
    } catch (error) {
      this.logger.error('Error al crear la planificación', error as Error);
      throw new InternalServerErrorException('Error al crear la planificación');
    }
  }

  /** Marca una planificación como la activa del paciente, desactivando las demás. */
  async setActiva(id: string, userId: string) {
    const planificacion = await this.prisma.planificacion.findFirst({
      where: { id, nutricionista_id: userId },
    });
    if (!planificacion) {
      this.logger.warn(
        `Acceso denegado: usuario ${userId} intentó activar la planificación ${id} (inexistente o de otro nutricionista)`,
      );
      throw new NotFoundException(
        'Planificación no encontrada o no tienes permisos',
      );
    }

    try {
      const [, updated] = await this.prisma.$transaction([
        this.prisma.planificacion.updateMany({
          where: {
            paciente_id: planificacion.paciente_id,
            nutricionista_id: userId,
            activa: true,
            id: { not: id },
          },
          data: { activa: false },
        }),
        this.prisma.planificacion.update({
          where: { id },
          data: { activa: true },
        }),
      ]);

      await this.redisService.client.del(`planificaciones:${userId}`);
      return updated;
    } catch (error) {
      this.logger.error('Error al activar la planificación', error as Error);
      throw new InternalServerErrorException(
        'Error al activar la planificación',
      );
    }
  }

  async findAll(userId: string) {
    try {
      const cacheKey = `planificaciones:${userId}`;
      const cached = await this.redisService.client.get(cacheKey);
      if (cached) return cached;

      const planificaciones = await this.prisma.planificacion.findMany({
        where: {
          nutricionista_id: userId,
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
        include: {
          pautas: {
            orderBy: {
              fecha_creacion: 'desc',
            },
          },
        },
      });

      await this.redisService.client.set(cacheKey, planificaciones, {
        ex: 3600,
      });
      return planificaciones;
    } catch (error) {
      this.logger.error('Error al obtener las planificaciones', error as Error);
      throw new InternalServerErrorException(
        'Error al obtener las planificaciones',
      );
    }
  }

  async remove(id: string, userId: string) {
    try {
      const deleted = await this.prisma.planificacion.delete({
        where: {
          id: id,
          nutricionista_id: userId,
        },
      });
      await this.redisService.client.del(`planificaciones:${userId}`);
      return deleted;
    } catch (error) {
      this.logger.error('Error al eliminar la planificación', error as Error);
      throw new InternalServerErrorException(
        'Error al eliminar la planificación',
      );
    }
  }
}
