import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Evaluaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evaluaciones')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una evaluación para un paciente' })
  create(@Body() createEvaluacionDto: CreateEvaluacionDto, @CurrentUser() user: any) {
    return this.evaluacionesService.create(createEvaluacionDto, user.userId);
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Obtener el historial de evaluaciones de un paciente' })
  findAllByPaciente(@Param('pacienteId') pacienteId: string, @CurrentUser() user: any) {
    return this.evaluacionesService.findAllByPaciente(pacienteId, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una evaluación específica' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.evaluacionesService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una evaluación' })
  update(@Param('id') id: string, @Body() updateEvaluacionDto: UpdateEvaluacionDto, @CurrentUser() user: any) {
    return this.evaluacionesService.update(id, updateEvaluacionDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una evaluación' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.evaluacionesService.remove(id, user.userId);
  }
}
