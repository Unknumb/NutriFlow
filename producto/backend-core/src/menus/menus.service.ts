import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisService } from 'src/redis/redis.service';
import { GenerarMenuDto } from './dto/generar-menu.dto';

@Injectable()
export class MenusService {
  constructor(
    private readonly httpService: HttpService,
    private redisService: RedisService
  ) {}

  async generarSugerencias(dto: GenerarMenuDto) {
    const cacheKey = `menus:${JSON.stringify(dto)}`;
    const cached = await this.redisService.client.get(cacheKey);
    if (cached) return cached;

    const url = 'http://127.0.0.1:8000/api/menus/generar-menu';
    try {
      const { data } = await firstValueFrom(this.httpService.post(url, dto));
      await this.redisService.client.set(cacheKey, data, { ex: 7200 }); // 2 horas
      return data;
    } catch (error) {
      console.error('Error al generar menú desde backend-math:', error);
      throw new InternalServerErrorException('Error al generar el menú. Verifica el backend matemático.');
    }
  }
}
