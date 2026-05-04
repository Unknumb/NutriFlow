import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Pacientes')
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo paciente' })
  @ApiResponse({ status: 201, description: 'El paciente ha sido creado exitosamente.' })
  create(@Body() createPacienteDto: CreatePacienteDto) {
    return this.pacientesService.create(createPacienteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los pacientes' })
  findAll() {
    return this.pacientesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un paciente por ID' })
  @ApiResponse({ status: 200, description: 'Paciente encontrado.' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.pacientesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un paciente existente' })
  update(@Param('id') id: string, @Body() updatePacienteDto: UpdatePacienteDto) {
    return this.pacientesService.update(id, updatePacienteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un paciente' })
  remove(@Param('id') id: string) {
    return this.pacientesService.remove(id);
  }
}
