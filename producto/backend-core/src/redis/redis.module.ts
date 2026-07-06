import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // Permite usar Redis en Pacientes, Pautas, etc., sin importarlo cada vez.
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
