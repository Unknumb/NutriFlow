import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreatePautaDto } from './dto/create-pauta.dto';
import { UpdatePautaDto } from './dto/update-pauta.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PautasService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService
  ) {}

  async create(createPautaDto: CreatePautaDto, nutricionista_id: string) {
    // 1. Obtener la última evaluación del paciente para extraer el peso
    const paciente = await this.prisma.pacientes.findFirst({
      where: { id: createPautaDto.paciente_id, nutricionista_id },
      include: {
        Evaluacion: {
          orderBy: { fecha_evaluacion: 'desc' },
          take: 1
        }
      }
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado o no tienes permisos para crearle pautas');
    }

    if (!paciente.Evaluacion || paciente.Evaluacion.length === 0) {
      throw new NotFoundException('El paciente debe tener al menos una Evaluación registrada para calcular su dieta');
    }

    const pesoKg = paciente.Evaluacion[0].peso_actual;

    // 2. Comunicarse con backend-math (Cuadrador)
    let cuadradorResult;
    try {
      const response = await firstValueFrom(
        this.httpService.post('http://localhost:8000/api/calculadoras/cuadrador', {
          estrategia_calculo: 'porcentajes',
          peso_kg: pesoKg,
          calorias_totales: createPautaDto.calorias_totales,
          porcentaje_proteina: createPautaDto.porcentajes_macros.proteina,
          porcentaje_grasa: createPautaDto.porcentajes_macros.grasa,
          porcentaje_carbohidrato: createPautaDto.porcentajes_macros.carbohidratos
        })
      );
      cuadradorResult = response.data;
    } catch (error) {
      console.error('Error al conectarse al cuadrador (backend-math):', error.message);
      throw new InternalServerErrorException('Error al calcular la distribución de macronutrientes');
    }

    // 3. Guardar la pauta en Prisma
    const pauta = await this.prisma.pauta.create({
      data: {
        paciente_id: createPautaDto.paciente_id,
        nutricionista_id,
        calorias_totales: createPautaDto.calorias_totales,
        distribucion_macros: cuadradorResult.distribucion,
        tiempos_comida: createPautaDto.tiempos_comida
      },
    });

    return pauta;
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
