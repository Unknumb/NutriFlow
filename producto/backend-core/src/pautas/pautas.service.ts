import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePautaDto } from './dto/create-pauta.dto';
import { UpdatePautaDto } from './dto/update-pauta.dto';
import { GuardarDistribucionDto } from './dto/guardar-distribucion.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class PautasService {
  private readonly logger = new Logger(PautasService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private redisService: RedisService,
  ) {}

  async create(createPautaDto: CreatePautaDto, nutricionista_id: string) {
    // 1. Obtener la última evaluación del paciente para extraer el peso
    const paciente = await this.prisma.pacientes.findFirst({
      where: { id: createPautaDto.paciente_id, nutricionista_id },
      include: {
        Evaluacion: {
          orderBy: { fecha_evaluacion: 'desc' },
          take: 1,
        },
      },
    });

    if (!paciente) {
      throw new NotFoundException(
        'Paciente no encontrado o no tienes permisos para crearle pautas',
      );
    }

    if (!paciente.Evaluacion || paciente.Evaluacion.length === 0) {
      throw new NotFoundException(
        'El paciente debe tener al menos una Evaluación registrada para calcular su dieta',
      );
    }

    // 2. (Desactivado temporalmente) Comunicarse con backend-math (Cuadrador)
    // El frontend ya nos envía los porcentajes calculados correctamente

    // 3. Guardar la pauta en Prisma
    const pauta = await this.prisma.pauta.create({
      data: {
        paciente_id: createPautaDto.paciente_id,
        nutricionista_id,
        planificacion_id: createPautaDto.planificacion_id,
        descripcion_general: createPautaDto.descripcion_general,
        tiempos_comida: createPautaDto.tiempos_comida,
      },
    });

    return pauta;
  }

  async guardarDistribucion(
    dto: GuardarDistribucionDto,
    nutricionista_id: string,
  ) {
    // P7: la pauta DEBE pertenecer a una planificación válida del paciente.
    if (!dto.planificacion_id) {
      throw new BadRequestException(
        'Debes asignar una planificación de macronutrientes antes de guardar la pauta.',
      );
    }
    const planificacion = await this.prisma.planificacion.findFirst({
      where: {
        id: dto.planificacion_id,
        nutricionista_id,
        paciente_id: dto.paciente_id,
      },
    });
    if (!planificacion) {
      throw new NotFoundException(
        'La planificación indicada no existe o no corresponde a este paciente.',
      );
    }

    const estructuraGrid = {
      distributions: dto.distributions,
      targets: dto.targets,
      activeMeals: dto.activeMeals || [],
      activeGroups: dto.activeGroups || [],
      libreConsumoIds: dto.libreConsumoIds || [],
      customMeals: dto.customMeals || [],
      mealTimes: dto.mealTimes || {},
    };

    // P6: si viene pauta_id se actualiza esa pauta; si no, se crea una nueva
    // dentro de la planificación, con nombre autosugerido "Pauta N".
    if (dto.pauta_id) {
      const existente = await this.prisma.pauta.findFirst({
        where: { id: dto.pauta_id, nutricionista_id },
      });
      if (!existente) {
        throw new NotFoundException(
          'Pauta no encontrada o no tienes permisos.',
        );
      }
      const updated = await this.prisma.pauta.update({
        where: { id: dto.pauta_id },
        data: {
          estructura_grid_json: estructuraGrid,
          planificacion_id: dto.planificacion_id,
          tiempos_comida: dto.activeMeals || [],
          ...(dto.nombre?.trim() ? { nombre: dto.nombre.trim() } : {}),
        },
      });
      // Las pautas van anidadas en planificaciones (findAll), así que su caché
      // queda obsoleta al cambiar una pauta.
      await this.redisService.client.del(`planificaciones:${nutricionista_id}`);
      return updated;
    }

    let nombre = dto.nombre?.trim();
    if (!nombre) {
      const existentes = await this.prisma.pauta.count({
        where: { planificacion_id: dto.planificacion_id, nutricionista_id },
      });
      nombre = `Pauta ${existentes + 1}`;
    }

    const created = await this.prisma.pauta.create({
      data: {
        paciente_id: dto.paciente_id,
        nutricionista_id,
        planificacion_id: dto.planificacion_id,
        nombre,
        tiempos_comida: dto.activeMeals || [],
        estructura_grid_json: estructuraGrid,
      },
    });
    await this.redisService.client.del(`planificaciones:${nutricionista_id}`);
    return created;
  }

  /** Lista las pautas (distribuciones) de un paciente para el selector. */
  async listarPorPaciente(paciente_id: string, nutricionista_id: string) {
    return this.prisma.pauta.findMany({
      where: { paciente_id, nutricionista_id },
      orderBy: { fecha_creacion: 'desc' },
      select: {
        id: true,
        nombre: true,
        planificacion_id: true,
        fecha_creacion: true,
      },
    });
  }

  async obtenerDistribucionPorPaciente(
    paciente_id: string,
    nutricionista_id: string,
  ) {
    const pauta = await this.prisma.pauta.findFirst({
      where: { paciente_id, nutricionista_id },
      orderBy: { fecha_creacion: 'desc' },
    });

    if (
      pauta &&
      pauta.estructura_grid_json &&
      Object.keys(pauta.estructura_grid_json).length > 0
    ) {
      return {
        id: pauta.id,
        nombre: pauta.nombre,
        planificacion_id: pauta.planificacion_id,
        estructura: pauta.estructura_grid_json,
      };
    }

    // Si no hay guardado, devolvemos null en vez de un mock
    // para no sobreescribir el estado del frontend con basura.
    return null;
  }

  findAllByNutricionista(nutricionista_id: string) {
    return this.prisma.pauta.findMany({
      where: { nutricionista_id },
      orderBy: { fecha_creacion: 'desc' },
    });
  }

  async findOne(id: string, nutricionista_id: string) {
    const pauta = await this.prisma.pauta.findFirst({
      where: { id, nutricionista_id },
    });

    if (!pauta) {
      this.logger.warn(
        `Acceso denegado: usuario ${nutricionista_id} solicitó la pauta ${id} (inexistente o de otro nutricionista)`,
      );
      throw new NotFoundException(
        `Pauta con ID ${id} no encontrada o no tienes permisos`,
      );
    }
    return pauta;
  }

  async update(
    id: string,
    updatePautaDto: UpdatePautaDto,
    nutricionista_id: string,
  ) {
    await this.findOne(id, nutricionista_id); // Verificar existencia y pertenencia

    return this.prisma.pauta.update({
      where: { id },
      data: updatePautaDto,
    });
  }

  async remove(id: string, nutricionista_id: string) {
    await this.findOne(id, nutricionista_id); // Verificar existencia y pertenencia

    const deleted = await this.prisma.pauta.delete({
      where: { id },
    });
    await this.redisService.client.del(`planificaciones:${nutricionista_id}`);
    return deleted;
  }
}
