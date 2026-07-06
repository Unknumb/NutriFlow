// backend-core/src/alimentos/alimentos.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateAlimentoDto } from './dto/create-alimento.dto';
import { UpdateAlimentoDto } from './dto/update-alimento.dto';
import { QueryAlimentosDto } from './dto/query-alimentos.dto';
import { sanitizeForLog } from '../common/utils/log.util';

/** Fila devuelta por la búsqueda raw (valores numéricos ya casteados a float8/int). */
interface AlimentoBusquedaRow {
  id: string;
  nombre: string;
  marca: string | null;
  categoria: string | null;
  calorias_100g: number;
  proteinas_100g: number;
  carbohidratos_100g: number;
  grasas_100g: number;
  restricciones: string[];
  total: number;
}

/** Clave que cachea backend-math con el catálogo completo (TTL 7 días). */
const CACHE_CATALOGO_MATH = 'alimentos:catalogo_completo';

/**
 * Categorías canónicas (grupos de intercambio + auxiliares). Se ofrecen siempre,
 * aunque aún no tengan alimentos, para poder asignar el primero desde la UI.
 * Deben calzar con MAPEO_CATEGORIAS de backend-math.
 */
const CATEGORIAS_CANONICAS = [
  'Cereales',
  'Frutas',
  'Verduras',
  'Carnes Bajas en Grasa',
  'Carnes Altas en Grasa',
  'Leguminosas',
  'Lácteos Bajos en Grasa',
  'Lácteos Medios en Grasa',
  'Lácteos Altos en Grasa',
  'Aceites y Grasas',
  'Alimentos ricos en grasas',
  'Galletas bajas en grasa',
  'Azúcares',
  'Libre Consumo',
  'Otros',
];

function esErrorDeUnique(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

@Injectable()
export class AlimentosService {
  private readonly logger = new Logger(AlimentosService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /**
   * Búsqueda server-side insensible a acentos/mayúsculas (extensión unaccent).
   * Relevancia: primero matches de prefijo, luego "contiene", ambos por nombre asc.
   * Con ~900 filas un seq scan es suficiente; no se justifica índice pg_trgm aún.
   */
  async buscar(query: QueryAlimentosDto) {
    const { search, categoria } = query;
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const termino = search?.trim();

    const condiciones: Prisma.Sql[] = [];
    if (termino) {
      condiciones.push(
        Prisma.sql`extensions.unaccent(a.nombre) ILIKE '%' || extensions.unaccent(${termino}) || '%'`,
      );
    }
    if (categoria) {
      condiciones.push(Prisma.sql`a.categoria = ${categoria}`);
    }
    const whereSql = condiciones.length
      ? Prisma.sql`WHERE ${Prisma.join(condiciones, ' AND ')}`
      : Prisma.empty;

    const ordenSql = termino
      ? Prisma.sql`ORDER BY (extensions.unaccent(a.nombre) ILIKE extensions.unaccent(${termino}) || '%') DESC, a.nombre ASC`
      : Prisma.sql`ORDER BY a.nombre ASC`;

    const filas = await this.prisma.$queryRaw<AlimentoBusquedaRow[]>(Prisma.sql`
      SELECT
        a.id,
        a.nombre,
        a.marca,
        a.categoria,
        a.calorias_100g::float8      AS calorias_100g,
        a.proteinas_100g::float8     AS proteinas_100g,
        a.carbohidratos_100g::float8 AS carbohidratos_100g,
        a.grasas_100g::float8        AS grasas_100g,
        a.restricciones,
        count(*) OVER ()::int        AS total
      FROM public.alimentos a
      ${whereSql}
      ${ordenSql}
      LIMIT ${limit} OFFSET ${offset}
    `);

    return {
      items: filas.map(({ total: _total, ...alimento }) => alimento),
      total: filas[0]?.total ?? 0,
      limit,
      offset,
    };
  }

  /**
   * Categorías para filtros y formularios: une las canónicas (siempre
   * disponibles, aunque no tengan alimentos) con las distintas presentes en el
   * catálogo, sin duplicar, ordenadas alfabéticamente.
   */
  async categorias(): Promise<string[]> {
    const filas = await this.prisma.alimentos.findMany({
      where: { categoria: { not: null } },
      distinct: ['categoria'],
      select: { categoria: true },
    });
    const existentes = filas.map((f) => f.categoria as string);
    const union = Array.from(new Set([...CATEGORIAS_CANONICAS, ...existentes]));
    return union.sort((a, b) => a.localeCompare(b, 'es'));
  }

  /**
   * Crea un alimento del catálogo. La categoría debe ser una existente
   * (vocabulario controlado: backend-math mapea categorías a grupos de porciones).
   * Duplicado (nombre, marca) → 409.
   */
  async crear(dto: CreateAlimentoDto) {
    if (dto.categoria) {
      const categoriasValidas = await this.categorias();
      if (!categoriasValidas.includes(dto.categoria)) {
        throw new BadRequestException(
          `La categoría "${dto.categoria}" no existe. Usa una de: ${categoriasValidas.join(', ')}`,
        );
      }
    }

    // Chequeo explícito: el unique (nombre, marca) de Postgres no aplica cuando
    // marca es NULL, así que cubrimos ese caso (y mayúsculas) manualmente.
    const duplicado = await this.prisma.alimentos.findFirst({
      where: {
        nombre: { equals: dto.nombre.trim(), mode: 'insensitive' },
        marca: dto.marca?.trim() ?? null,
      },
      select: { id: true },
    });
    if (duplicado) {
      throw new ConflictException(
        `Ya existe un alimento "${dto.nombre.trim()}"${dto.marca ? ` de la marca "${dto.marca.trim()}"` : ' sin marca'}`,
      );
    }

    try {
      const creado = await this.prisma.alimentos.create({
        data: {
          nombre: dto.nombre.trim(),
          marca: dto.marca?.trim() ?? null,
          categoria: dto.categoria ?? null,
          calorias_100g: dto.calorias_100g,
          proteinas_100g: dto.proteinas_100g,
          carbohidratos_100g: dto.carbohidratos_100g,
          grasas_100g: dto.grasas_100g,
          restricciones: dto.restricciones ?? [],
        },
      });

      await this.invalidarCaches();
      this.logger.log(
        `Alimento creado: ${sanitizeForLog(creado.nombre)} (${creado.id})`,
      );
      return this.toResponse(creado);
    } catch (error) {
      if (esErrorDeUnique(error)) {
        throw new ConflictException(
          `Ya existe un alimento "${dto.nombre.trim()}" con esa marca`,
        );
      }
      throw error;
    }
  }

  /**
   * Actualiza un alimento (incluye moverlo de categoría). Valida categoría
   * y duplicado (nombre, marca) igual que `crear`. Invalida cachés al final.
   */
  async actualizar(id: string, dto: UpdateAlimentoDto) {
    const existente = await this.prisma.alimentos.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundException(`Alimento ${id} no encontrado`);
    }

    if (dto.categoria !== undefined && dto.categoria !== null) {
      const categoriasValidas = await this.categorias();
      if (!categoriasValidas.includes(dto.categoria)) {
        throw new BadRequestException(
          `La categoría "${dto.categoria}" no existe. Usa una de: ${categoriasValidas.join(', ')}`,
        );
      }
    }

    // Si cambia nombre o marca, verificar que no choque con otro alimento.
    const nuevoNombre = dto.nombre?.trim() ?? existente.nombre;
    const nuevaMarca =
      dto.marca !== undefined ? (dto.marca?.trim() ?? null) : existente.marca;
    if (dto.nombre !== undefined || dto.marca !== undefined) {
      const duplicado = await this.prisma.alimentos.findFirst({
        where: {
          id: { not: id },
          nombre: { equals: nuevoNombre, mode: 'insensitive' },
          marca: nuevaMarca,
        },
        select: { id: true },
      });
      if (duplicado) {
        throw new ConflictException(
          `Ya existe otro alimento "${nuevoNombre}"${nuevaMarca ? ` de la marca "${nuevaMarca}"` : ' sin marca'}`,
        );
      }
    }

    const data: Prisma.alimentosUpdateInput = {};
    if (dto.nombre !== undefined) data.nombre = nuevoNombre;
    if (dto.marca !== undefined) data.marca = nuevaMarca;
    if (dto.categoria !== undefined) data.categoria = dto.categoria ?? null;
    if (dto.calorias_100g !== undefined) data.calorias_100g = dto.calorias_100g;
    if (dto.proteinas_100g !== undefined)
      data.proteinas_100g = dto.proteinas_100g;
    if (dto.carbohidratos_100g !== undefined)
      data.carbohidratos_100g = dto.carbohidratos_100g;
    if (dto.grasas_100g !== undefined) data.grasas_100g = dto.grasas_100g;
    if (dto.restricciones !== undefined) data.restricciones = dto.restricciones;

    try {
      const actualizado = await this.prisma.alimentos.update({
        where: { id },
        data,
      });
      await this.invalidarCaches();
      this.logger.log(
        `Alimento actualizado: ${sanitizeForLog(actualizado.nombre)} (${id})`,
      );
      return this.toResponse(actualizado);
    } catch (error) {
      if (esErrorDeUnique(error)) {
        throw new ConflictException(
          `Ya existe otro alimento "${nuevoNombre}" con esa marca`,
        );
      }
      throw error;
    }
  }

  /**
   * Elimina un alimento del catálogo. Se bloquea (409) si el alimento está
   * usado en preparaciones o pautas, para no corromper esos registros: la
   * nutricionista debe quitarlo de ahí primero.
   */
  async eliminar(id: string) {
    const existente = await this.prisma.alimentos.findUnique({
      where: { id },
      select: { id: true, nombre: true },
    });
    if (!existente) {
      throw new NotFoundException(`Alimento ${id} no encontrado`);
    }

    const [usosEnPreparaciones, usosEnPautas] = await Promise.all([
      this.prisma.ingredientes_preparacion.count({
        where: { alimento_id: id },
      }),
      this.prisma.detalle_pauta.count({ where: { alimento_id: id } }),
    ]);

    if (usosEnPreparaciones > 0 || usosEnPautas > 0) {
      const partes: string[] = [];
      if (usosEnPreparaciones > 0)
        partes.push(`${usosEnPreparaciones} preparación(es)`);
      if (usosEnPautas > 0) partes.push(`${usosEnPautas} pauta(s)`);
      throw new ConflictException(
        `No se puede eliminar "${existente.nombre}" porque está en uso en ${partes.join(' y ')}. Quítalo de ahí primero.`,
      );
    }

    await this.prisma.alimentos.delete({ where: { id } });
    await this.invalidarCaches();
    this.logger.log(
      `Alimento eliminado: ${sanitizeForLog(existente.nombre)} (${id})`,
    );
    return { id, eliminado: true };
  }

  /**
   * Invalida el catálogo cacheado por backend-math (TTL 7 días) y los menús
   * generados. Un fallo de invalidación no aborta la escritura (TTL acota la
   * inconsistencia), mismo criterio que PreparacionesService.
   */
  private async invalidarCaches(): Promise<void> {
    try {
      await this.redisService.client.del(CACHE_CATALOGO_MATH);
      const keys = await this.redisService.client.keys('menus:*');
      if (keys.length > 0) {
        await this.redisService.client.del(...keys);
      }
      this.logger.log('Caches de catálogo de alimentos y menús invalidadas');
    } catch (error) {
      this.logger.error(
        'No se pudo invalidar la cache de alimentos/menús',
        error as Error,
      );
    }
  }

  /** Normaliza Decimal→number para mantener el mismo contrato que la búsqueda. */
  private toResponse(a: {
    id: string;
    nombre: string;
    marca: string | null;
    categoria: string | null;
    calorias_100g: Prisma.Decimal;
    proteinas_100g: Prisma.Decimal;
    carbohidratos_100g: Prisma.Decimal;
    grasas_100g: Prisma.Decimal;
    restricciones: string[];
  }) {
    return {
      id: a.id,
      nombre: a.nombre,
      marca: a.marca,
      categoria: a.categoria,
      calorias_100g: Number(a.calorias_100g),
      proteinas_100g: Number(a.proteinas_100g),
      carbohidratos_100g: Number(a.carbohidratos_100g),
      grasas_100g: Number(a.grasas_100g),
      restricciones: a.restricciones,
    };
  }
}
