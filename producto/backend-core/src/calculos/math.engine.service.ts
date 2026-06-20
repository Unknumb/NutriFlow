import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisService } from 'src/redis/redis.service';
import { GuardarDistribucionMacrosDto } from './dto/guardar-distribucion.dto';

@Injectable()
export class MathEngineService {
  // URL base del motor matemático (backend-math). Configurable vía MATH_ENGINE_URL para el deploy.
  private readonly pythonUrl = `${process.env.MATH_ENGINE_URL ?? 'http://localhost:8000'}/api/calculadoras`;

  constructor(
    private readonly httpService: HttpService,
    private redisService: RedisService
  ) {}

  /**
   * Llama al endpoint de TMB en FastAPI
   */
  async obtenerTMB(datos: any) {
    // IMPORTANTE: El objeto 'datos' debe tener las llaves 'peso_kg' y 'talla_cm'
    // tal como definiste en tu schema DatosPaciente de Python.
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.pythonUrl}/tmb`, datos)
    );
    return data;
  }

  /**
   * Llama al Cuadrador de Macros en FastAPI
   */
  async obtenerCuadrador(datos: any) {
    const cacheKey = `cuadrador:${JSON.stringify(datos)}`;
    const cached = await this.redisService.client.get(cacheKey);
    if (cached) return cached;

    // Este apunta a /api/calculadoras/cuadrador
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.pythonUrl}/cuadrador`, datos)
    );
    
    await this.redisService.client.set(cacheKey, data, { ex: 86400 }); // 24h
    return data;
  }

  /**
   * Recibe la distribución configurada por la nutricionista y la guarda.
   * Mock temporal.
   */
  async guardarDistribucionMacros(dto: GuardarDistribucionMacrosDto) {
    // Aquí a futuro guardaremos en Prisma o conectaremos con FastAPI
    return {
      status: 'success',
      message: 'Distribución guardada correctamente',
      data: dto,
    };
  }
}