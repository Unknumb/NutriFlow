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
    const parsedPeso = peso ? parseFloat(peso) : 0;
    const parsedTalla = talla ? parseFloat(talla) : 0;
    const parsedEdad = edad ? parseInt(edad, 10) : 0;
    
    const datosParaPython = {
      peso_kg: parsedPeso > 0 ? parsedPeso : 67.4,
      talla_cm: parsedTalla > 0 ? parsedTalla : 170,
      edad: parsedEdad > 0 ? parsedEdad : 23,
      sexo: (sexo === 'M' || sexo === 'F') ? sexo : 'M',
      porcentaje_grasa: null
    };

    // 2. Llamamos al método correcto del servicio (obtenerTMB)
    const resultadoTMB = await this.mathService.obtenerTMB(datosParaPython);

    // 3. Retornamos la respuesta consolidada.
    // Los pesos de referencia los calcula backend-math junto con la TMB.
    return {
      pacienteId: id,
      tmb: resultadoTMB,
      macros: null, // Por ahora
      pesos: resultadoTMB?.pesos_referencia ?? null,
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