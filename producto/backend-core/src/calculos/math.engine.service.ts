import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisService } from 'src/redis/redis.service';
import { GuardarDistribucionMacrosDto } from './dto/guardar-distribucion.dto';

/** Resultado del cálculo de TMB devuelto por backend-math. */
export interface TmbResult {
  promedio_calculado: number;
  pesos_referencia?: unknown;
  [key: string]: unknown;
}

/** Resultado del cuadrador de macros (estructura variable de backend-math). */
export type CuadradorResult = Record<string, unknown>;

/** Datos de entrada para los cálculos del motor matemático. */
export type DatosCalculo = Record<string, unknown>;

@Injectable()
export class MathEngineService {
  private readonly logger = new Logger(MathEngineService.name);

  // URL base del motor matemático (backend-math). Configurable vía MATH_ENGINE_URL para el deploy.
  private readonly pythonUrl = `${process.env.MATH_ENGINE_URL ?? 'http://localhost:8000'}/api/calculadoras`;

  constructor(
    private readonly httpService: HttpService,
    private redisService: RedisService,
  ) {}

  /**
   * Llama al endpoint de TMB en FastAPI
   */
  async obtenerTMB(datos: DatosCalculo): Promise<TmbResult> {
    // IMPORTANTE: El objeto 'datos' debe tener las llaves 'peso_kg' y 'talla_cm'
    // tal como definiste en tu schema DatosPaciente de Python.
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<TmbResult>(`${this.pythonUrl}/tmb`, datos),
      );
      return data;
    } catch (error) {
      this.logger.error(
        'Error al calcular TMB desde backend-math',
        error as Error,
      );
      throw new InternalServerErrorException(
        'Error al calcular la TMB. Verifica el backend matemático.',
      );
    }
  }

  /**
   * Llama al Cuadrador de Macros en FastAPI
   */
  async obtenerCuadrador(datos: DatosCalculo): Promise<CuadradorResult> {
    const cacheKey = `cuadrador:${JSON.stringify(datos)}`;
    const cached =
      await this.redisService.client.get<CuadradorResult>(cacheKey);
    if (cached) return cached;

    try {
      // Este apunta a /api/calculadoras/cuadrador
      const { data } = await firstValueFrom(
        this.httpService.post<CuadradorResult>(
          `${this.pythonUrl}/cuadrador`,
          datos,
        ),
      );

      await this.redisService.client.set(cacheKey, data, { ex: 86400 }); // 24h
      return data;
    } catch (error) {
      this.logger.error(
        'Error al calcular el cuadrador desde backend-math',
        error as Error,
      );
      throw new InternalServerErrorException(
        'Error al calcular la distribución de macros. Verifica el backend matemático.',
      );
    }
  }

  /**
   * Recibe la distribución configurada por la nutricionista y la guarda.
   * Mock temporal.
   */
  guardarDistribucionMacros(dto: GuardarDistribucionMacrosDto) {
    // Aquí a futuro guardaremos en Prisma o conectaremos con FastAPI
    return {
      status: 'success',
      message: 'Distribución guardada correctamente',
      data: dto,
    };
  }
}
