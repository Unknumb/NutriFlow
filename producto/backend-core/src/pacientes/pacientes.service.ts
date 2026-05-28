import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PacientesService {
  constructor(private prisma: PrismaService) {}

  create(createPacienteDto: CreatePacienteDto, nutricionista_id: string) {
    return this.prisma.pacientes.create({
      data: {
        ...createPacienteDto,
        fecha_nacimiento: new Date(createPacienteDto.fecha_nacimiento),
        nutricionista_id,
      },
    });
  }

  findAll(nutricionista_id: string) {
    return this.prisma.pacientes.findMany({
      where: { nutricionista_id },
      orderBy: { fecha_creacion: 'desc' },
    });
  }

  async findOne(id: string, nutricionista_id: string) {
    const paciente = await this.prisma.pacientes.findFirst({ 
      where: { id, nutricionista_id } 
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

