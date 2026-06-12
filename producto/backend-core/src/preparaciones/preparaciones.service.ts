// backend-core/src/preparaciones/preparaciones.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreatePreparacionDto } from './dto/create-preparacion.dto';
import { UpdatePreparacionDto } from './dto/update-preparacion.dto';

type PreparacionConIngredientes = Prisma.preparacionesGetPayload<{
  include: { ingredientes_preparacion: { include: { alimentos: true } } };
}>;

const INCLUDE_INGREDIENTES = {
  ingredientes_preparacion: { include: { alimentos: true } },
} as const;

/** Detecta violación de FK (ej. alimento_id inexistente). */
function esErrorDeFk(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  );
}

@Injectable()
export class PreparacionesService {
  private readonly logger = new Logger(PreparacionesService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /** Propias del nutricionista + las del sistema (nutricionista_id NULL). */
  async findAll(nutricionista_id: string) {
    const preparaciones = await this.prisma.preparaciones.findMany({
      where: { OR: [{ nutricionista_id: null }, { nutricionista_id }] },
      include: INCLUDE_INGREDIENTES,
      orderBy: [{ fecha_creacion: 'desc' }, { nombre: 'asc' }],
    });
    return preparaciones.map((p) => this.toResponse(p));
  }

  async create(dto: CreatePreparacionDto, nutricionista_id: string) {
    const { ingredientes, ...data } = dto;

    try {
      const creada = await this.prisma.$transaction(async (tx) => {
        const preparacion = await tx.preparaciones.create({
          data: { ...data, nutricionista_id },
        });
        await tx.ingredientes_preparacion.createMany({
          data: ingredientes.map((ing) => ({
            preparacion_id: preparacion.id,
            alimento_id: ing.alimento_id,
            cantidad_g: ing.cantidad_g,
          })),
        });
        return tx.preparaciones.findUniqueOrThrow({
          where: { id: preparacion.id },
          include: INCLUDE_INGREDIENTES,
        });
      });

      await this.invalidarCacheMenus();
      return this.toResponse(creada);
    } catch (error) {
      if (esErrorDeFk(error)) {
        throw new BadRequestException(
          'Uno o más alimentos indicados no existen en la base de datos',
        );
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdatePreparacionDto, nutricionista_id: string) {
    await this.verificarPropiedad(id, nutricionista_id);
    const { ingredientes, ...data } = dto;

    try {
      const actualizada = await this.prisma.$transaction(async (tx) => {
        await tx.preparaciones.update({ where: { id }, data });

        if (ingredientes) {
          await tx.ingredientes_preparacion.deleteMany({
            where: { preparacion_id: id },
          });
          await tx.ingredientes_preparacion.createMany({
            data: ingredientes.map((ing) => ({
              preparacion_id: id,
              alimento_id: ing.alimento_id,
              cantidad_g: ing.cantidad_g,
            })),
          });
        }

        return tx.preparaciones.findUniqueOrThrow({
          where: { id },
          include: INCLUDE_INGREDIENTES,
        });
      });

      await this.invalidarCacheMenus();
      return this.toResponse(actualizada);
    } catch (error) {
      if (esErrorDeFk(error)) {
        throw new BadRequestException(
          'Uno o más alimentos indicados no existen en la base de datos',
        );
      }
      throw error;
    }
  }

  async remove(id: string, nutricionista_id: string) {
    await this.verificarPropiedad(id, nutricionista_id);
    // ingredientes_preparacion tiene ON DELETE CASCADE
    const eliminada = await this.prisma.preparaciones.delete({ where: { id } });
    await this.invalidarCacheMenus();
    return eliminada;
  }

  /**
   * 404 si no existe o pertenece a otro nutricionista (no revelamos existencia),
   * 403 si es una preparación del sistema (solo lectura).
   */
  private async verificarPropiedad(id: string, nutricionista_id: string) {
    const preparacion = await this.prisma.preparaciones.findUnique({
      where: { id },
      select: { nutricionista_id: true },
    });

    if (!preparacion) {
      throw new NotFoundException(`Preparación con ID ${id} no encontrada`);
    }
    if (preparacion.nutricionista_id === null) {
      throw new ForbiddenException(
        'Las preparaciones del sistema no se pueden modificar ni eliminar',
      );
    }
    if (preparacion.nutricionista_id !== nutricionista_id) {
      throw new NotFoundException(`Preparación con ID ${id} no encontrada`);
    }
  }

  /**
   * Invalida todas las claves `menus:*` cacheadas por MenusService.
   * Usamos KEYS porque @upstash/redis lo soporta vía REST y el volumen de
   * claves de menús es bajo (TTL 2h); si crece, migrar a SCAN incremental.
   * Un fallo de invalidación no aborta la escritura (el TTL acota la inconsistencia).
   */
  private async invalidarCacheMenus(): Promise<void> {
    try {
      const keys = await this.redisService.client.keys('menus:*');
      if (keys.length > 0) {
        await this.redisService.client.del(...keys);
        this.logger.log(`Cache de menús invalidada (${keys.length} claves)`);
      }
    } catch (error) {
      this.logger.error('No se pudo invalidar la cache de menús', error as Error);
    }
  }

  /** Normaliza Decimal→number y calcula totales nutricionales desde los ingredientes. */
  private toResponse(p: PreparacionConIngredientes) {
    const ingredientes = p.ingredientes_preparacion.map((ing) => {
      const cantidad_g = Number(ing.cantidad_g);
      const factor = cantidad_g / 100;
      return {
        id: ing.id,
        alimento_id: ing.alimento_id,
        nombre: ing.alimentos.nombre,
        marca: ing.alimentos.marca,
        categoria: ing.alimentos.categoria,
        cantidad_g,
        calorias: redondear(Number(ing.alimentos.calorias_100g) * factor),
        proteinas: redondear(Number(ing.alimentos.proteinas_100g) * factor),
        carbohidratos: redondear(Number(ing.alimentos.carbohidratos_100g) * factor),
        grasas: redondear(Number(ing.alimentos.grasas_100g) * factor),
      };
    });

    const totales = ingredientes.reduce(
      (acc, ing) => ({
        calorias: acc.calorias + ing.calorias,
        proteinas: acc.proteinas + ing.proteinas,
        carbohidratos: acc.carbohidratos + ing.carbohidratos,
        grasas: acc.grasas + ing.grasas,
      }),
      { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 },
    );

    return {
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      instrucciones: p.instrucciones,
      tipo_comida: p.tipo_comida,
      imagen_url: p.imagen_url,
      fecha_creacion: p.fecha_creacion,
      es_sistema: p.nutricionista_id === null,
      ingredientes,
      totales: {
        calorias: redondear(totales.calorias),
        proteinas: redondear(totales.proteinas),
        carbohidratos: redondear(totales.carbohidratos),
        grasas: redondear(totales.grasas),
      },
    };
  }
}

function redondear(valor: number): number {
  return Math.round(valor * 10) / 10;
}
