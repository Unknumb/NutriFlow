import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvaluacionesService {
  constructor(private prisma: PrismaService) {}

  async create(createEvaluacionDto: CreateEvaluacionDto, nutricionistaId: string) {
    // Seguridad adicional: Verificar que el paciente le pertenece a esta nutricionista antes de evaluarlo
    const paciente = await this.prisma.pacientes.findFirst({
      where: { id: createEvaluacionDto.paciente_id, nutricionista_id: nutricionistaId },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado o no tienes permisos para evaluarlo');
    }

    return this.prisma.evaluacion.create({
      data: {
        ...createEvaluacionDto,
        nutricionista_id: nutricionistaId,
      },
    });
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
