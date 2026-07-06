import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService {
  public readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    // Presencia garantizada por la validación de entorno (env.validation.ts).
    this.client = new Redis({
      url: this.configService.get<string>('UPSTASH_REDIS_REST_URL')!,
      token: this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN')!,
    });
    this.logger.log('Conexión a base de datos Redis conectada exitosamente');
  }
}
