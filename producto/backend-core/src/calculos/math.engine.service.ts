import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GuardarDistribucionMacrosDto } from './dto/guardar-distribucion.dto';

@Injectable()
export class MathEngineService {
  // 1. Ajustamos la URL base según tu main.py (prefix: /api/calculadoras)
  private readonly pythonUrl = 'http://127.0.0.1:8000/api/calculadoras';

  constructor(private readonly httpService: HttpService) {}

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
    // Este apunta a /api/calculadoras/cuadrador
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.pythonUrl}/cuadrador`, datos)
    );
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