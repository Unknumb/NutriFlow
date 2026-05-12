import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { MathEngineService } from './math.engine.service';
import { GuardarDistribucionMacrosDto } from './dto/guardar-distribucion.dto';

@ApiTags('Dashboard Clínico')
@Controller('dashboard-clinico')
export class CalculosController {
  constructor(private readonly mathService: MathEngineService) {}

  @Get(':pacienteId')
  @ApiOperation({ summary: 'Obtiene las métricas iniciales del paciente (TMB)' })
  async obtenerMetricas(
    @Param('pacienteId') id: string,
    @Query('peso') peso: string,
    @Query('talla') talla: string,
    @Query('edad') edad: string,
    @Query('sexo') sexo: string,
  ) {
    // 1. Mapeamos los datos exactamente como los espera 'DatosPaciente' en FastAPI
    const datosParaPython = {
      peso_kg: peso ? parseFloat(peso) : 67.4,
      talla_cm: talla ? parseFloat(talla) : 170,
      edad: edad ? parseInt(edad, 10) : 23,
      sexo: sexo || 'M',
      porcentaje_grasa: null
    };

    // 2. Llamamos al método correcto del servicio (obtenerTMB)
    const resultadoTMB = await this.mathService.obtenerTMB(datosParaPython);

    // 3. Retornamos la respuesta consolidada
    return {
      pacienteId: id,
      tmb: resultadoTMB,
      macros: null, // Por ahora
      pesos: null,  // Añadido para coincidir con la interfaz del Frontend
      status: 'success'
    };
  }

  @Post('macronutrientes')
  @ApiOperation({ summary: 'Guarda la distribución de macronutrientes configurada por la nutricionista' })
  @ApiBody({ type: GuardarDistribucionMacrosDto })
  async guardarMacronutrientes(@Body() dto: GuardarDistribucionMacrosDto) {
    return this.mathService.guardarDistribucionMacros(dto);
  }
}