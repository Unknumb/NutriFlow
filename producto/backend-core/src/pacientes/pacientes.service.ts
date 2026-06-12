import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

/** Detecta violación del índice único parcial (nutricionista_id, rut). */
function esConflictoRut(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

@Injectable()
export class PacientesService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async create(createPacienteDto: CreatePacienteDto, nutricionista_id: string) {
    const { talla_cm, peso_kg, ...pacienteData } = createPacienteDto;

    const result = await this.prisma.$transaction(async (prisma) => {
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

    await this.redisService.client.del(`pacientes:${nutricionista_id}`);
    
    return result;
  }

  async findAll(nutricionista_id: string) {
    const cacheKey = `pacientes:${nutricionista_id}`;
    
    const cachedPacientes = await this.redisService.client.get(cacheKey);
    if (cachedPacientes) {
      return cachedPacientes;
    }

    const pacientes = await this.prisma.pacientes.findMany({
      where: { nutricionista_id },
      orderBy: { fecha_creacion: 'desc' },
      include: { Evaluacion: { orderBy: { fecha_evaluacion: 'desc' }, take: 1 } },
    });

    await this.redisService.client.set(cacheKey, pacientes, { ex: 3600 });

    return pacientes;
  }

  async findOne(id: string, nutricionista_id: string) {
    const cacheKey = `paciente:${id}:${nutricionista_id}`;

    const cachedPaciente = await this.redisService.client.get(cacheKey);
    if (cachedPaciente) {
      return cachedPaciente;
    }

    const paciente = await this.prisma.pacientes.findFirst({ 
      where: { id, nutricionista_id },
      include: { Evaluacion: { orderBy: { fecha_evaluacion: 'desc' }, take: 1 } },
    });
    
    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado o no tienes permisos de acceso`);
    }

    await this.redisService.client.set(cacheKey, paciente, { ex: 3600 });

    return paciente;
  }

  async update(id: string, updatePacienteDto: UpdatePacienteDto, nutricionista_id: string) {
    await this.findOne(id, nutricionista_id); // Verificar existencia y pertenencia
    const dataToUpdate: any = { ...updatePacienteDto };
    
    if (updatePacienteDto.fecha_nacimiento) {
      dataToUpdate.fecha_nacimiento = new Date(updatePacienteDto.fecha_nacimiento);
    }

    const updatedPaciente = await this.prisma.pacientes.update({
      where: { id },
      data: dataToUpdate,
    });

    await Promise.all([
      this.redisService.client.del(`paciente:${id}:${nutricionista_id}`),
      this.redisService.client.del(`pacientes:${nutricionista_id}`)
    ]);

    return updatedPaciente;
  }

  async remove(id: string, nutricionista_id: string) {
    await this.findOne(id, nutricionista_id); // Verificar existencia y pertenencia
    const deletedPaciente = await this.prisma.pacientes.delete({ where: { id } });

    await Promise.all([
      this.redisService.client.del(`paciente:${id}:${nutricionista_id}`),
      this.redisService.client.del(`pacientes:${nutricionista_id}`)
    ]);

    return deletedPaciente;
  }
}
