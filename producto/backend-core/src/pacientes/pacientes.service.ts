import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PacientesService {
  constructor(private prisma: PrismaService) {}

  async create(createPacienteDto: CreatePacienteDto, nutricionista_id: string) {
    const { talla_cm, peso_kg, ...pacienteData } = createPacienteDto;
    
    return this.prisma.$transaction(async (prisma) => {
      const paciente = await prisma.pacientes.create({
        data: {
          ...pacienteData,
          fecha_nacimiento: new Date(pacienteData.fecha_nacimiento),
          nutricionista_id,
        },
      });

      if (talla_cm && peso_kg) {
        await prisma.evaluacion.create({
          data: {
            paciente_id: paciente.id,
            nutricionista_id,
            peso_actual: Number(peso_kg),
            talla_cm: Number(talla_cm),
            nivel_actividad_fisica: 'Sedentario', // Default value
            objetivo: 'Mantención', // Default value
          }
        });
      }

      // Return patient with their new evaluation
      return prisma.pacientes.findUnique({
        where: { id: paciente.id },
        include: { Evaluacion: { orderBy: { fecha_evaluacion: 'desc' }, take: 1 } },
      });
    });
  }

  findAll(nutricionista_id: string) {
    return this.prisma.pacientes.findMany({
      where: { nutricionista_id },
      orderBy: { fecha_creacion: 'desc' },
      include: { Evaluacion: { orderBy: { fecha_evaluacion: 'desc' }, take: 1 } },
    });
  }

  async findOne(id: string, nutricionista_id: string) {
    const paciente = await this.prisma.pacientes.findFirst({ 
      where: { id, nutricionista_id },
      include: { Evaluacion: { orderBy: { fecha_evaluacion: 'desc' }, take: 1 } },
    });
    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado o no tienes permisos de acceso`);
    }
    return paciente;
  }

  async update(id: string, updatePacienteDto: UpdatePacienteDto, nutricionista_id: string) {
    await this.findOne(id, nutricionista_id); // Verificar existencia y pertenencia
    const dataToUpdate: any = { ...updatePacienteDto };
    
    if (updatePacienteDto.fecha_nacimiento) {
      dataToUpdate.fecha_nacimiento = new Date(updatePacienteDto.fecha_nacimiento);
    }

    return this.prisma.pacientes.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string, nutricionista_id: string) {
    await this.findOne(id, nutricionista_id); // Verificar existencia y pertenencia
    return this.prisma.pacientes.delete({ where: { id } });
  }
}

