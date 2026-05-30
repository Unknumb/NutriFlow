import { Test, TestingModule } from '@nestjs/testing';
import { PlanificacionesService } from './planificaciones.service';

describe('PlanificacionesService', () => {
  let service: PlanificacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanificacionesService],
    }).compile();

    service = module.get<PlanificacionesService>(PlanificacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
