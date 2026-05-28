import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EvaluacionesService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService
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
    const niveles = {
      'sedentario': 1.2,
      'ligero': 1.375,
      'moderado': 1.55,
      'activo': 1.725,
      'muy activo': 1.9
    };
    return niveles[nivel.toLowerCase()] || 1.2;
  }

  async create(createEvaluacionDto: CreateEvaluacionDto, nutricionistaId: string) {
    // Seguridad adicional: Verificar que el paciente le pertenece a esta nutricionista antes de evaluarlo
    const paciente = await this.prisma.pacientes.findFirst({
      where: { id: createEvaluacionDto.paciente_id, nutricionista_id: nutricionistaId },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado o no tienes permisos para evaluarlo');
    }

    const edad = this.calculateAge(paciente.fecha_nacimiento);
    // Asumimos que sexo_biologico es "MASCULINO" o "FEMENINO" o "M" o "F"
    const sexoUpper = paciente.sexo_biologico?.toUpperCase();
    const sexoStr = (sexoUpper === 'MASCULINO' || sexoUpper === 'M') ? 'M' : 'F';

    let calculosTmb;
    try {
      // 3. Petición HTTP al motor matemático (usamos el prefijo /api/calculadoras definido en FastAPI)
      const response = await firstValueFrom(
        this.httpService.post('http://localhost:8000/api/calculadoras/tmb', {
          sexo: sexoStr,
          edad: edad,
          talla_cm: createEvaluacionDto.talla_cm,
          peso_kg: createEvaluacionDto.peso_actual
        })
      );
      calculosTmb = response.data;
    } catch (error) {
      console.error('Error al conectarse a backend-math:', error.message);
      throw new InternalServerErrorException('Error al calcular TMB en el motor matemático');
    }

    const tmbPromedio = calculosTmb.promedio_calculado;
    const factorActividad = this.getActivityFactor(createEvaluacionDto.nivel_actividad_fisica);
    const gastoEnergeticoTotal = Math.round(tmbPromedio * factorActividad);

    const evaluacion = await this.prisma.evaluacion.create({
      data: {
        ...createEvaluacionDto,
        nutricionista_id: nutricionistaId,
      },
    });

    return {
      evaluacion,
      calculos: {
        tmb: calculosTmb,
        gasto_energetico_total: gastoEnergeticoTotal
      }
    };
  }

  async findAllByPaciente(pacienteId: string, nutricionistaId: string) {
    // Esto asegura que la nutricionista solo vea las evaluaciones de SUS propios pacientes
    return this.prisma.evaluacion.findMany({
      where: {
        paciente_id: pacienteId,
        nutricionista_id: nutricionistaId,
      },
      orderBy: { fecha_evaluacion: 'desc' }, // Traemos la más reciente primero
    });
  }

  async findOne(id: string, nutricionistaId: string) {
    const evaluacion = await this.prisma.evaluacion.findFirst({
      where: { id, nutricionista_id: nutricionistaId },
    });

    if (!evaluacion) {
      throw new NotFoundException('Evaluación no encontrada');
    }
    return evaluacion;
  }

  async update(id: string, updateEvaluacionDto: UpdateEvaluacionDto, nutricionistaId: string) {
    await this.findOne(id, nutricionistaId); // Reutilizamos findOne para garantizar que la evaluación le pertenece

    return this.prisma.evaluacion.update({
      where: { id },
      data: updateEvaluacionDto,
    });
  }

  async remove(id: string, nutricionistaId: string) {
    await this.findOne(id, nutricionistaId); // Garantizar pertenencia

    return this.prisma.evaluacion.delete({
      where: { id },
    });
  }
}
