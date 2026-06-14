// backend-core/src/preparaciones/preparaciones.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PreparacionesService } from './preparaciones.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const NUTRI_ID = '11111111-1111-1111-1111-111111111111';
const OTRO_NUTRI_ID = '22222222-2222-2222-2222-222222222222';
const PREP_ID = '33333333-3333-3333-3333-333333333333';

describe('PreparacionesService', () => {
  let service: PreparacionesService;

  const prismaMock = {
    preparaciones: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const redisMock = {
    client: {
      keys: jest.fn().mockResolvedValue([]),
      del: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreparacionesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get(PreparacionesService);
  });

  describe('findAll', () => {
    it('calcula totales nutricionales desde los ingredientes y marca es_sistema', async () => {
      prismaMock.preparaciones.findMany.mockResolvedValue([
        {
          id: PREP_ID,
          nombre: 'Avena con leche',
          descripcion: null,
          instrucciones: null,
          tipo_comida: 'desayuno',
          imagen_url: null,
          fecha_creacion: new Date(),
          nutricionista_id: null,
          ingredientes_preparacion: [
            {
              id: 'i1',
              alimento_id: 'a1',
              cantidad_g: 50,
              alimentos: {
                nombre: 'Avena',
                marca: 'Genérico',
                categoria: 'Cereales',
                calorias_100g: 389,
                proteinas_100g: 16.9,
                carbohidratos_100g: 66.3,
                grasas_100g: 6.9,
              },
            },
            {
              id: 'i2',
              alimento_id: 'a2',
              cantidad_g: 200,
              alimentos: {
                nombre: 'Leche descremada',
                marca: 'Genérico',
                categoria: 'Lácteos Bajos en Grasa',
                calorias_100g: 35,
                proteinas_100g: 3.4,
                carbohidratos_100g: 5,
                grasas_100g: 0.1,
              },
            },
          ],
        },
      ]);

      const [prep] = await service.findAll(NUTRI_ID);

      expect(prismaMock.preparaciones.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { OR: [{ nutricionista_id: null }, { nutricionista_id: NUTRI_ID }] },
        }),
      );
      expect(prep.es_sistema).toBe(true);
      // 389*0.5 + 35*2 = 194.5 + 70 = 264.5 kcal
      expect(prep.totales.calorias).toBe(264.5);
      // 16.9*0.5 + 3.4*2 = 8.5 (redondeado a 1 decimal) + 6.8 = 15.3 ≈ 15.2/15.3 según redondeo por ingrediente
      expect(prep.totales.proteinas).toBeCloseTo(15.3, 1);
      expect(prep.ingredientes).toHaveLength(2);
      expect(prep.ingredientes[0].nombre).toBe('Avena');
    });
  });

  describe('update / remove (propiedad)', () => {
    it('lanza 404 si la preparación no existe', async () => {
      prismaMock.preparaciones.findUnique.mockResolvedValue(null);
      await expect(service.remove(PREP_ID, NUTRI_ID)).rejects.toThrow(NotFoundException);
    });

    it('lanza 403 si la preparación es del sistema', async () => {
      prismaMock.preparaciones.findUnique.mockResolvedValue({ nutricionista_id: null });
      await expect(service.remove(PREP_ID, NUTRI_ID)).rejects.toThrow(ForbiddenException);
    });

    it('lanza 404 (sin revelar existencia) si es de otro nutricionista', async () => {
      prismaMock.preparaciones.findUnique.mockResolvedValue({ nutricionista_id: OTRO_NUTRI_ID });
      await expect(service.update(PREP_ID, { nombre: 'X' }, NUTRI_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('elimina una preparación propia e invalida la cache de menús', async () => {
      prismaMock.preparaciones.findUnique.mockResolvedValue({ nutricionista_id: NUTRI_ID });
      prismaMock.preparaciones.delete.mockResolvedValue({ id: PREP_ID });
      redisMock.client.keys.mockResolvedValue(['menus:abc', 'menus:def']);

      await service.remove(PREP_ID, NUTRI_ID);

      expect(prismaMock.preparaciones.delete).toHaveBeenCalledWith({ where: { id: PREP_ID } });
      expect(redisMock.client.del).toHaveBeenCalledWith('menus:abc', 'menus:def');
    });
  });
});
