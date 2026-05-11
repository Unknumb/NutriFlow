import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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
}