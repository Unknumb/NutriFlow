// backend-core/src/alimentos/alimentos.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { AlimentosService } from './alimentos.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const ALIMENTO_ID = '44444444-4444-4444-4444-444444444444';

describe('AlimentosService', () => {
  let service: AlimentosService;

  const prismaMock = {
    $queryRaw: jest.fn(),
    alimentos: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const redisMock = {
    client: {
      keys: jest.fn().mockResolvedValue([]),
      del: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    redisMock.client.keys.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlimentosService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get(AlimentosService);
  });

  describe('buscar', () => {
    it('devuelve items sin la columna total y expone total/limit/offset para paginación', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id: ALIMENTO_ID,
          nombre: 'Plátano',
          marca: 'Genérico',
          categoria: 'Frutas',
          calorias_100g: 89,
          proteinas_100g: 1.1,
          carbohidratos_100g: 22.8,
          grasas_100g: 0.3,
          restricciones: [],
          total: 3,
        },
      ]);

      const resultado = await service.buscar({
        search: 'platano',
        limit: 20,
        offset: 0,
      });

      expect(resultado.total).toBe(3);
      expect(resultado.limit).toBe(20);
      expect(resultado.offset).toBe(0);
      expect(resultado.items).toHaveLength(1);
      expect(resultado.items[0]).not.toHaveProperty('total');
      expect(resultado.items[0].nombre).toBe('Plátano');
    });

    it('devuelve total 0 cuando no hay resultados', async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);
      const resultado = await service.buscar({
        search: 'inexistente',
        limit: 20,
        offset: 0,
      });
      expect(resultado.total).toBe(0);
      expect(resultado.items).toEqual([]);
    });
  });

  describe('categorias', () => {
    it('une las categorías canónicas con las del catálogo, sin duplicar y ordenadas', async () => {
      // 'Cereales' ya es canónica (no debe duplicarse); 'Suplementos' no lo es (se agrega).
      prismaMock.alimentos.findMany.mockResolvedValue([
        { categoria: 'Cereales' },
        { categoria: 'Suplementos' },
      ]);

      const cats = await service.categorias();

      expect(cats.filter((c) => c === 'Cereales')).toHaveLength(1); // sin duplicados
      expect(cats).toEqual(
        expect.arrayContaining(['Cereales', 'Frutas', 'Suplementos']),
      );
      // El resultado viene ordenado alfabéticamente (locale es).
      const ordenada = [...cats].sort((a, b) => a.localeCompare(b, 'es'));
      expect(cats).toEqual(ordenada);
    });
  });

  describe('crear', () => {
    const dto = {
      nombre: 'Quinoa cocida',
      categoria: 'Cereales',
      calorias_100g: 120,
      proteinas_100g: 4.4,
      carbohidratos_100g: 21.3,
      grasas_100g: 1.9,
    };

    it('rechaza con 400 una categoría inexistente', async () => {
      // 'Cereales' es canónica y sería válida; usamos una categoría realmente inexistente.
      prismaMock.alimentos.findMany.mockResolvedValue([
        { categoria: 'Frutas' },
      ]);
      await expect(
        service.crear({ ...dto, categoria: 'CategoríaInventada' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.alimentos.create).not.toHaveBeenCalled();
    });

    it('rechaza con 409 un duplicado (nombre, marca) — incluye marca NULL', async () => {
      prismaMock.alimentos.findMany.mockResolvedValue([
        { categoria: 'Cereales' },
      ]);
      prismaMock.alimentos.findFirst.mockResolvedValue({ id: ALIMENTO_ID });
      await expect(service.crear(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prismaMock.alimentos.create).not.toHaveBeenCalled();
    });

    it('crea el alimento, normaliza Decimal→number e invalida las caches', async () => {
      prismaMock.alimentos.findMany.mockResolvedValue([
        { categoria: 'Cereales' },
      ]);
      prismaMock.alimentos.findFirst.mockResolvedValue(null);
      prismaMock.alimentos.create.mockResolvedValue({
        id: ALIMENTO_ID,
        nombre: 'Quinoa cocida',
        marca: null,
        categoria: 'Cereales',
        calorias_100g: '120',
        proteinas_100g: '4.4',
        carbohidratos_100g: '21.3',
        grasas_100g: '1.9',
        restricciones: [],
      });
      redisMock.client.keys.mockResolvedValue(['menus:abc']);

      const creado = await service.crear(dto);

      expect(creado.calorias_100g).toBe(120);
      expect(typeof creado.proteinas_100g).toBe('number');
      // Invalida el catálogo que cachea backend-math y los menús generados
      expect(redisMock.client.del).toHaveBeenCalledWith(
        'alimentos:catalogo_completo',
      );
      expect(redisMock.client.del).toHaveBeenCalledWith('menus:abc');
    });
  });
});
