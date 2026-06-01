import { Test, TestingModule } from '@nestjs/testing';
import { PlanificacionesController } from './planificaciones.controller';

describe('PlanificacionesController', () => {
  let controller: PlanificacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanificacionesController],
    }).compile();

    controller = module.get<PlanificacionesController>(PlanificacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
