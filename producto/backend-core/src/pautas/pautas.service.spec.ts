import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PautasService } from './pautas.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

/**
 * Pruebas unitarias de PautasService.
 *
 * Se mockean Prisma, Redis y HttpService (no se llama a backend-math en estos
 * casos). Se cubre: validación de la planificación obligatoria, autosugerencia
 * del nombre "Pauta N" e invalidación de caché, y el manejo del 404 en findOne.
 */
describe('PautasService', () => {
  let service: PautasService;
  let prismaMock: any;
  let redisMock: any;

  const NUTRI_ID = 'nutri-123';

  beforeEach(async () => {
    prismaMock = {
      pauta: {
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
      },
      planificacion: { findFirst: jest.fn() },
      pacientes: { findFirst: jest.fn() },
    };
    redisMock = { client: { del: jest.fn().mockResolvedValue(1) } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PautasService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: HttpService, useValue: {} },
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get<PautasService>(PautasService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('guardarDistribucion()', () => {
    it('lanza BadRequestException si no se entrega una planificación', async () => {
      await expect(
        service.guardarDistribucion({ paciente_id: 'pac-1' }, NUTRI_ID),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.pauta.create).not.toHaveBeenCalled();
    });

    it('crea una pauta nueva con nombre autosugerido "Pauta N" e invalida la caché', async () => {
      prismaMock.planificacion.findFirst.mockResolvedValue({ id: 'plan-1' });
      prismaMock.pauta.count.mockResolvedValue(2); // ya existen 2 -> debe nombrar "Pauta 3"
      prismaMock.pauta.create.mockResolvedValue({
        id: 'pauta-3',
        nombre: 'Pauta 3',
      });

      const dto = {
        paciente_id: 'pac-1',
        planificacion_id: 'plan-1',
        distributions: {},
        targets: {},
      };
      const creada = await service.guardarDistribucion(dto, NUTRI_ID);

      expect(creada).toEqual({ id: 'pauta-3', nombre: 'Pauta 3' });
      expect(prismaMock.pauta.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nombre: 'Pauta 3',
            planificacion_id: 'plan-1',
          }),
        }),
      );
      expect(redisMock.client.del).toHaveBeenCalledWith(
        `planificaciones:${NUTRI_ID}`,
      );
    });
  });

  describe('findOne()', () => {
    it('lanza NotFoundException cuando la pauta no existe o no pertenece al nutricionista', async () => {
      prismaMock.pauta.findFirst.mockResolvedValue(null);
      await expect(
        service.findOne('inexistente', NUTRI_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
