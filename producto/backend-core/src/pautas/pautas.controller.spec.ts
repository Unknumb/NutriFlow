import { Test, TestingModule } from '@nestjs/testing';
import { PautasController } from './pautas.controller';
import { PautasService } from './pautas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Pruebas unitarias de PautasController. Se mockea el servicio y se sustituye el
 * guard JWT. Se valida la delegación y la forma de la respuesta de
 * guardar-distribución (success + pautaId).
 */
describe('PautasController', () => {
  let controller: PautasController;
  let service: any;

  const USER = { userId: 'nutri-123' };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      guardarDistribucion: jest.fn(),
      findAllByNutricionista: jest.fn(),
      findOne: jest.fn(),
      listarPorPaciente: jest.fn(),
      obtenerDistribucionPorPaciente: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PautasController],
      providers: [{ provide: PautasService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PautasController>(PautasController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('guardarDistribucion() responde con success y el id de la pauta creada', async () => {
    service.guardarDistribucion.mockResolvedValue({ id: 'pauta-9' });

    const payload = { paciente_id: 'pac-1', planificacion_id: 'plan-1' } as any;
    const resp = await controller.guardarDistribucion(payload, USER);

    expect(service.guardarDistribucion).toHaveBeenCalledWith(
      payload,
      USER.userId,
    );
    expect(resp).toEqual({
      success: true,
      message: 'Distribución guardada correctamente',
      pautaId: 'pauta-9',
    });
  });
});
