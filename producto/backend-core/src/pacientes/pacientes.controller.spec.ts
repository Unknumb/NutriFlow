import { Test, TestingModule } from '@nestjs/testing';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Pruebas unitarias de PacientesController.
 *
 * El controlador sólo orquesta: se valida que delegue en el servicio y que
 * inyecte el `userId` que viene en el token JWT (vía @CurrentUser). El servicio
 * se mockea y el guard JWT se sustituye por uno que siempre deja pasar.
 */
describe('PacientesController', () => {
  let controller: PacientesController;
  let service: any;

  const USER = { userId: 'nutri-123' };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PacientesController],
      providers: [{ provide: PacientesService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PacientesController>(PacientesController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create() delega en el servicio inyectando el nutricionista del token', async () => {
    const dto: any = { nombre: 'Juan', apellido: 'Pérez' };
    const creado = { id: 'pac-1' };
    service.create.mockResolvedValue(creado);

    await expect(controller.create(dto, USER)).resolves.toEqual(creado);
    expect(service.create).toHaveBeenCalledWith(dto, USER.userId);
  });

  it('findOne() delega en el servicio con el id y el nutricionista del token', async () => {
    const paciente = { id: 'pac-1' };
    service.findOne.mockResolvedValue(paciente);

    await expect(controller.findOne('pac-1', USER)).resolves.toEqual(paciente);
    expect(service.findOne).toHaveBeenCalledWith('pac-1', USER.userId);
  });
});
