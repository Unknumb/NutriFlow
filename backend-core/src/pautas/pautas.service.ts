import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePautaDto } from './dto/create-pauta.dto';
import { UpdatePautaDto } from './dto/update-pauta.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PautasService {
  constructor(private prisma: PrismaService) {}

  create(createPautaDto: CreatePautaDto, nutricionista_id: string) {
    return this.prisma.pauta.create({
      data: {
        ...createPautaDto,
        nutricionista_id,
      },
    });
  }

  findAllByNutricionista(nutricionista_id: string) {
    return this.prisma.pauta.findMany({
      where: { nutricionista_id },
      orderBy: { fecha_creacion: 'desc' },
    });
  }

  async findOne(id: string, nutricionista_id: string) {
    const pauta = await this.prisma.pauta.findFirst({
      where: { id, nutricionista_id },
    });
    
    if (!pauta) {
      throw new NotFoundException(`Pauta con ID ${id} no encontrada o no tienes permisos`);
    }
    return pauta;
  }

  async update(id: string, updatePautaDto: UpdatePautaDto, nutricionista_id: string) {
    await this.findOne(id, nutricionista_id); // Verificar existencia y pertenencia

    return this.prisma.pauta.update({
      where: { id },
      data: updatePautaDto as any,
    });
  }

  async remove(id: string, nutricionista_id: string) {
    await this.findOne(id, nutricionista_id); // Verificar existencia y pertenencia
    
    return this.prisma.pauta.delete({
      where: { id },
    });
  }
}
