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

  findAll() {
    return this.prisma.pacientes.findMany();
  }

  async findOne(id: string) {
    const paciente = await this.prisma.pacientes.findUnique({ where: { id } });
    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }
    return paciente;
  }

  async update(id: string, updatePacienteDto: UpdatePacienteDto) {
    await this.findOne(id); // Verificar existencia
    const dataToUpdate: any = { ...updatePacienteDto };
    
    if (updatePacienteDto.fecha_nacimiento) {
      dataToUpdate.fecha_nacimiento = new Date(updatePacienteDto.fecha_nacimiento);
    }

    return this.prisma.pacientes.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verificar existencia
    return this.prisma.pacientes.delete({ where: { id } });
  }
}

