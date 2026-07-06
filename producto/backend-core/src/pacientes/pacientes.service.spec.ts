import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';

/**
 * Pruebas unitarias de PacientesService.
 *
 * Se aíslan las dependencias externas (PostgreSQL vía Prisma y la caché Redis)
 * con mocks, de modo que las pruebas validan SÓLO la lógica del servicio:
 * creación con invalidación de caché y manejo del error 404.
 */
describe('PacientesService', () => {
  let service: PacientesService;
  let prismaMock: any;
  let redisMock: any;

  const NUTRI_ID = 'nutri-123';

  beforeEach(async () => {
    // Mock de Prisma: incluye el callback transaccional y los modelos usados.
    prismaMock = {
      $transaction: jest.fn(),
      pacientes: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      evaluacion: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    // Mock de Redis: sólo se necesita el cliente con get/set/del.
    redisMock = {
      client: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn().mockResolvedValue(1),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PacientesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get<PacientesService>(PacientesService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('crea el paciente (con evaluación inicial) e invalida la caché de la lista', async () => {
      const dto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        fecha_nacimiento: '1990-05-20',
        talla_cm: 175,
        peso_kg: 70,
      } as CreatePacienteDto;

      const pacienteCreado = { id: 'pac-1', nombre: 'Juan', apellido: 'Pérez' };

      // El cliente transaccional recibido dentro de $transaction.
      const txMock = {
        pacientes: {
          create: jest.fn().mockResolvedValue({ id: 'pac-1' }),
          findUnique: jest.fn().mockResolvedValue(pacienteCreado),
        },
        evaluacion: { create: jest.fn().mockResolvedValue({ id: 'eval-1' }) },
      };
      // $transaction ejecuta el callback con el cliente transaccional simulado.
      prismaMock.$transaction.mockImplementation(async (cb: any) => cb(txMock));

      const resultado = await service.create(dto, NUTRI_ID);

      expect(resultado).toEqual(pacienteCreado);
      // Se crea el paciente con el nutricionista dueño.
      expect(txMock.pacientes.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nombre: 'Juan',
            nutricionista_id: NUTRI_ID,
          }),
        }),
      );
      // Como llegaron talla y peso, se crea la evaluación inicial.
      expect(txMock.evaluacion.create).toHaveBeenCalledTimes(1);
      // Y se invalida la caché de la lista del nutricionista.
      expect(redisMock.client.del).toHaveBeenCalledWith(
        `pacientes:${NUTRI_ID}`,
      );
    });
  });

  describe('findOne()', () => {
    it('lanza NotFoundException cuando el paciente no existe o no pertenece al nutricionista', async () => {
      redisMock.client.get.mockResolvedValue(null); // sin caché
      prismaMock.pacientes.findFirst.mockResolvedValue(null); // no existe en DB

      await expect(
        service.findOne('inexistente', NUTRI_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      // No debe cachear un resultado nulo.
      expect(redisMock.client.set).not.toHaveBeenCalled();
    });

    it('devuelve el paciente desde la caché sin consultar la base de datos', async () => {
      const cacheado = { id: 'pac-1', nombre: 'Juan' };
      redisMock.client.get.mockResolvedValue(cacheado);

      const resultado = await service.findOne('pac-1', NUTRI_ID);

      expect(resultado).toEqual(cacheado);
      expect(prismaMock.pacientes.findFirst).not.toHaveBeenCalled();
    });
  });
});
