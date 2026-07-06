import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PlanificacionesService } from './planificaciones.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

/**
 * Pruebas unitarias de PlanificacionesService.
 *
 * Cubre la regla "una planificación activa por paciente" y la autosugerencia de
 * nombre ("Planificación N"), el 404 al activar una inexistente y la lectura
 * desde caché. La transacción de Prisma se mockea para devolver el resultado.
 */
describe('PlanificacionesService', () => {
  let service: PlanificacionesService;
  let prismaMock: any;
  let redisMock: any;

  const USER_ID = 'nutri-123';

  beforeEach(async () => {
    prismaMock = {
      $transaction: jest.fn(),
      planificacion: {
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
    };
    redisMock = {
      client: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn().mockResolvedValue(1),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanificacionesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get<PlanificacionesService>(PlanificacionesService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('autosugiere "Planificación N", la marca como activa e invalida la caché', async () => {
      prismaMock.planificacion.count.mockResolvedValue(0); // primera del paciente -> "Planificación 1"
      const creada = { id: 'plan-1', nombre: 'Planificación 1', activa: true };
      // $transaction devuelve [resultado de updateMany, planificación creada].
      prismaMock.$transaction.mockResolvedValue([{ count: 0 }, creada]);

      const dto: any = {
        paciente_id: 'pac-1',
        calorias_totales: 2000,
        distribucion_macros: {},
      };
      const resultado = await service.create(dto, USER_ID);

      expect(resultado).toEqual(creada);
      expect(prismaMock.planificacion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nombre: 'Planificación 1',
            activa: true,
          }),
        }),
      );
      expect(redisMock.client.del).toHaveBeenCalledWith(
        `planificaciones:${USER_ID}`,
      );
    });
  });

  describe('setActiva()', () => {
    it('lanza NotFoundException cuando la planificación no existe o no pertenece al nutricionista', async () => {
      prismaMock.planificacion.findFirst.mockResolvedValue(null);
      await expect(
        service.setActiva('inexistente', USER_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findAll()', () => {
    it('devuelve las planificaciones desde la caché sin consultar la base de datos', async () => {
      const cacheado = [{ id: 'plan-1' }];
      redisMock.client.get.mockResolvedValue(cacheado);

      await expect(service.findAll(USER_ID)).resolves.toEqual(cacheado);
      expect(prismaMock.planificacion.findMany).not.toHaveBeenCalled();
    });
  });
});
