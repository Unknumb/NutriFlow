import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/estado (GET) -> chequeo de estado público', () => {
    return request(app.getHttpServer())
      .get('/estado')
      .expect(200)
      .expect((res) => {
        expect(res.body.servidor).toBe(true);
        expect(typeof res.body.baseDatos).toBe('boolean');
        expect(typeof res.body.hora).toBe('string');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
