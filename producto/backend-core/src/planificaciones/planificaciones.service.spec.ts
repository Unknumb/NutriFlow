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

  describe('update()', () => {
    it('lanza NotFoundException cuando la planificación no existe o no pertenece al nutricionista', async () => {
      prismaMock.planificacion.findFirst.mockResolvedValue(null);
      await expect(
        service.update('inexistente', { calorias_totales: 1900 }, USER_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('sobrescribe calorías/macros, la deja activa e invalida la caché', async () => {
      const existente = {
        id: 'plan-1',
        paciente_id: 'pac-1',
        nutricionista_id: USER_ID,
        activa: false,
      };
      prismaMock.planificacion.findFirst.mockResolvedValue(existente);
      const actualizada = {
        ...existente,
        activa: true,
        calorias_totales: 1900,
      };
      prismaMock.$transaction.mockResolvedValue([{ count: 1 }, actualizada]);

      const dto: any = {
        calorias_totales: 1900,
        distribucion_macros: { proteina: 30, grasa: 25, carbohidratos: 45 },
      };
      const resultado = await service.update('plan-1', dto, USER_ID);

      expect(resultado).toEqual(actualizada);
      // Desactiva las demás planificaciones activas del paciente (menos esta).
      expect(prismaMock.planificacion.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            paciente_id: 'pac-1',
            activa: true,
            id: { not: 'plan-1' },
          }),
          data: { activa: false },
        }),
      );
      expect(prismaMock.planificacion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'plan-1' },
          data: expect.objectContaining({
            activa: true,
            calorias_totales: 1900,
            distribucion_macros: dto.distribucion_macros,
          }),
        }),
      );
      expect(redisMock.client.del).toHaveBeenCalledWith(
        `planificaciones:${USER_ID}`,
      );
    });

    it('no toca el nombre cuando no se envía (solo actualiza lo enviado)', async () => {
      prismaMock.planificacion.findFirst.mockResolvedValue({
        id: 'plan-1',
        paciente_id: 'pac-1',
        nutricionista_id: USER_ID,
      });
      prismaMock.$transaction.mockResolvedValue([
        { count: 0 },
        { id: 'plan-1' },
      ]);

      await service.update('plan-1', { calorias_totales: 1800 }, USER_ID);

      const dataEnviada = prismaMock.planificacion.update.mock.calls[0][0].data;
      expect(dataEnviada).not.toHaveProperty('nombre');
      expect(dataEnviada).not.toHaveProperty('distribucion_macros');
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
