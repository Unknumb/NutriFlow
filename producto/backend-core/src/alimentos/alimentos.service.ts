// backend-core/src/alimentos/alimentos.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateAlimentoDto } from './dto/create-alimento.dto';
import { QueryAlimentosDto } from './dto/query-alimentos.dto';

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

  /** Categorías distintas del catálogo, para los filtros del frontend. */
  async categorias(): Promise<string[]> {
    const filas = await this.prisma.alimentos.findMany({
      where: { categoria: { not: null } },
      distinct: ['categoria'],
      select: { categoria: true },
      orderBy: { categoria: 'asc' },
    });
    return filas.map((f) => f.categoria as string);
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
      this.logger.log(`Alimento creado: ${creado.nombre} (${creado.id})`);
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
      this.logger.error('No se pudo invalidar la cache de alimentos/menús', error as Error);
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
