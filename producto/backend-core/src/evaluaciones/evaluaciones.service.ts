import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisService } from 'src/redis/redis.service';
import { TmbResult } from '../calculos/math.engine.service';

@Injectable()
export class EvaluacionesService {
  private readonly logger = new Logger(EvaluacionesService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private redisService: RedisService,
  ) {}

  private calculateAge(fechaNacimiento: Date): number {
    const today = new Date();
    let age = today.getFullYear() - fechaNacimiento.getFullYear();
    const m = today.getMonth() - fechaNacimiento.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < fechaNacimiento.getDate())) {
      age--;
    }
    return age;
  }

  private getActivityFactor(nivel: string): number {
    const niveles: Record<string, number> = {
      sedentario: 1.2,
      ligero: 1.375,
      moderado: 1.55,
      activo: 1.725,
      'muy activo': 1.9,
    };
    return niveles[nivel.toLowerCase()] || 1.2;
  }

  /**
   * Calcula la TMB (promedio del motor matemático) y el gasto energético total
   * a partir de los datos del paciente y de la evaluación. Centralizado para que
   * tanto la creación como la EDICIÓN recalculen automáticamente (antes el update
   * no recalculaba y la TMB/gasto quedaban stale al cambiar peso/talla/actividad).
   */
  private async calcularTmbYGasto(
    paciente: { fecha_nacimiento: Date; sexo_biologico: string | null },
    tallaCm: number,
    pesoKg: number,
    nivelActividad: string,
  ) {
    const edad = this.calculateAge(paciente.fecha_nacimiento);
    const sexoUpper = paciente.sexo_biologico?.toUpperCase();
    const sexoStr = sexoUpper === 'MASCULINO' || sexoUpper === 'M' ? 'M' : 'F';

    let calculosTmb: TmbResult;
    try {
      const cacheKey = `tmb:${sexoStr}:${edad}:${tallaCm}:${pesoKg}`;
      const cachedTmb = await this.redisService.client.get<TmbResult>(cacheKey);

      if (cachedTmb) {
        calculosTmb = cachedTmb;
      } else {
        const response = await firstValueFrom(
          this.httpService.post<TmbResult>(
            `${process.env.MATH_ENGINE_URL ?? 'http://localhost:8000'}/api/calculadoras/tmb`,
            {
              sexo: sexoStr,
              edad: edad,
              talla_cm: tallaCm,
              peso_kg: pesoKg,
            },
          ),
        );
        calculosTmb = response.data;
        await this.redisService.client.set(cacheKey, calculosTmb, {
          ex: 86400,
        }); // Caché de 24h
      }
    } catch (error) {
      this.logger.error('Error al conectarse a backend-math', error as Error);
      throw new InternalServerErrorException(
        'Error al calcular TMB en el motor matemático',
      );
    }

    const tmbPromedio = calculosTmb.promedio_calculado;
    const factorActividad = this.getActivityFactor(nivelActividad);
    const gastoEnergeticoTotal = Math.round(tmbPromedio * factorActividad);

    return { tmbPromedio, gastoEnergeticoTotal, calculosTmb };
  }

  async create(
    createEvaluacionDto: CreateEvaluacionDto,
    nutricionistaId: string,
  ) {
    // Seguridad adicional: Verificar que el paciente le pertenece a esta nutricionista antes de evaluarlo
    const paciente = await this.prisma.pacientes.findFirst({
      where: {
        id: createEvaluacionDto.paciente_id,
        nutricionista_id: nutricionistaId,
      },
    });

    if (!paciente) {
      throw new NotFoundException(
        'Paciente no encontrado o no tienes permisos para evaluarlo',
      );
    }

    const { tmbPromedio, gastoEnergeticoTotal, calculosTmb } =
      await this.calcularTmbYGasto(
        paciente,
        createEvaluacionDto.talla_cm,
        createEvaluacionDto.peso_actual,
        createEvaluacionDto.nivel_actividad_fisica,
      );

    const evaluacion = await this.prisma.evaluacion.create({
      data: {
        ...createEvaluacionDto,
        nutricionista_id: nutricionistaId,
        tmb: tmbPromedio,
        gasto_energetico_total: gastoEnergeticoTotal,
      },
    });

    // Invalida la caché de la lista de evaluaciones del paciente
    await this.redisService.client.del(
      `evaluaciones:${createEvaluacionDto.paciente_id}:${nutricionistaId}`,
    );

    return {
      evaluacion,
      calculos: {
        tmb: calculosTmb,
        gasto_energetico_total: gastoEnergeticoTotal,
      },
    };
  }

  async findAllByPaciente(pacienteId: string, nutricionistaId: string) {
    const cacheKey = `evaluaciones:${pacienteId}:${nutricionistaId}`;
    const cached = await this.redisService.client.get(cacheKey);

    if (cached) {
      return cached;
    }

    // Esto asegura que la nutricionista solo vea las evaluaciones de SUS propios pacientes
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: {
        paciente_id: pacienteId,
        nutricionista_id: nutricionistaId,
      },
      orderBy: { fecha_evaluacion: 'desc' }, // Traemos la más reciente primero
    });

    await this.redisService.client.set(cacheKey, evaluaciones, { ex: 3600 });
    return evaluaciones;
  }

  async findOne(id: string, nutricionistaId: string) {
    const evaluacion = await this.prisma.evaluacion.findFirst({
      where: { id, nutricionista_id: nutricionistaId },
    });

    if (!evaluacion) {
      this.logger.warn(
        `Acceso denegado: usuario ${nutricionistaId} solicitó la evaluación ${id} (inexistente o de otro nutricionista)`,
      );
      throw new NotFoundException('Evaluación no encontrada');
    }
    return evaluacion;
  }

  async update(
    id: string,
    updateEvaluacionDto: UpdateEvaluacionDto,
    nutricionistaId: string,
  ) {
    const evaluacion = await this.findOne(id, nutricionistaId); // Reutilizamos findOne para garantizar que la evaluación le pertenece

    // Recalcula automáticamente TMB y gasto con los valores resultantes (merge de
    // lo enviado + lo existente). Sobrescribe cualquier tmb/gasto que venga del
    // formulario, para que editar peso/talla/actividad actualice los cálculos.
    const tallaCm = updateEvaluacionDto.talla_cm ?? evaluacion.talla_cm;
    const pesoKg = updateEvaluacionDto.peso_actual ?? evaluacion.peso_actual;
    const nivel =
      updateEvaluacionDto.nivel_actividad_fisica ??
      evaluacion.nivel_actividad_fisica;

    const paciente = await this.prisma.pacientes.findFirst({
      where: { id: evaluacion.paciente_id, nutricionista_id: nutricionistaId },
    });

    let calculados: { tmb: number; gasto_energetico_total: number } | null =
      null;
    if (paciente && tallaCm && pesoKg) {
      const { tmbPromedio, gastoEnergeticoTotal } =
        await this.calcularTmbYGasto(paciente, tallaCm, pesoKg, nivel);
      calculados = {
        tmb: tmbPromedio,
        gasto_energetico_total: gastoEnergeticoTotal,
      };
    }

    const updated = await this.prisma.evaluacion.update({
      where: { id },
      data: { ...updateEvaluacionDto, ...(calculados ?? {}) },
    });

    await this.redisService.client.del(
      `evaluaciones:${evaluacion.paciente_id}:${nutricionistaId}`,
    );
    return updated;
  }

  async remove(id: string, nutricionistaId: string) {
    const evaluacion = await this.findOne(id, nutricionistaId); // Garantizar pertenencia

    const deleted = await this.prisma.evaluacion.delete({
      where: { id },
    });

    await this.redisService.client.del(
      `evaluaciones:${evaluacion.paciente_id}:${nutricionistaId}`,
    );
    return deleted;
  }
}
