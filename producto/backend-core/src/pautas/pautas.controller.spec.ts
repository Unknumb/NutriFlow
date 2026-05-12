import { Test, TestingModule } from '@nestjs/testing';
import { PautasController } from './pautas.controller';
import { PautasService } from './pautas.service';

describe('PautasController', () => {
  let controller: PautasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PautasController],
      providers: [PautasService],
    }).compile();

    controller = module.get<PautasController>(PautasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
