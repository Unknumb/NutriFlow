import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreatePlanificacionDto } from './dto/create-planificacion.dto';

@Injectable()
export class PlanificacionesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(createPlanificacionDto: CreatePlanificacionDto, userId: string) {
    try {
      const planificacion = await this.prisma.planificacion.create({
        data: {
          paciente_id: createPlanificacionDto.paciente_id,
          nutricionista_id: userId,
          calorias_totales: createPlanificacionDto.calorias_totales,
          distribucion_macros: createPlanificacionDto.distribucion_macros as any,
        },
      });

      return planificacion;
    } catch (error) {
      console.error('Error al crear la planificación:', error);
      throw new InternalServerErrorException('Error al crear la planificación');
    }
  }

  async findAll(userId: string) {
    try {
      return await this.prisma.planificacion.findMany({
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
    } catch (error) {
      console.error('Error al obtener las planificaciones:', error);
      throw new InternalServerErrorException('Error al obtener las planificaciones');
    }
  }

  async remove(id: string, userId: string) {
    try {
      return await this.prisma.planificacion.delete({
        where: {
          id: id,
          nutricionista_id: userId,
        },
      });
    } catch (error) {
      console.error('Error al eliminar la planificación:', error);
      throw new InternalServerErrorException('Error al eliminar la planificación');
    }
  }
}
