import { Test, TestingModule } from '@nestjs/testing';
import { PlanificacionesController } from './planificaciones.controller';
import { PlanificacionesService } from './planificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Pruebas unitarias de PlanificacionesController. Se mockea el servicio y se
 * sustituye el guard JWT; se valida la delegación inyectando el nutricionista
 * del token.
 */
describe('PlanificacionesController', () => {
  let controller: PlanificacionesController;
  let service: any;

  const USER = { userId: 'nutri-123' };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      setActiva: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanificacionesController],
      providers: [{ provide: PlanificacionesService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PlanificacionesController>(
      PlanificacionesController,
    );
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create() delega en el servicio con el nutricionista del token', async () => {
    const dto: any = { paciente_id: 'pac-1' };
    service.create.mockResolvedValue({ id: 'plan-1' });

    await expect(controller.create(dto, USER)).resolves.toEqual({
      id: 'plan-1',
    });
    expect(service.create).toHaveBeenCalledWith(dto, USER.userId);
  });

  it('setActiva() delega en el servicio con el id y el nutricionista del token', async () => {
    service.setActiva.mockResolvedValue({ id: 'plan-1', activa: true });

    await expect(controller.setActiva('plan-1', USER)).resolves.toEqual({
      id: 'plan-1',
      activa: true,
    });
    expect(service.setActiva).toHaveBeenCalledWith('plan-1', USER.userId);
  });
});
