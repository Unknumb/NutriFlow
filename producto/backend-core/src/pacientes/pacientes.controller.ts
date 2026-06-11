import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Pacientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo paciente' })
  @ApiResponse({ status: 201, description: 'El paciente ha sido creado exitosamente.' })
  create(@Body() createPacienteDto: CreatePacienteDto, @CurrentUser() user: any) {
    return this.pacientesService.create(createPacienteDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los pacientes' })
  findAll(@CurrentUser() user: any) {
    return this.pacientesService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un paciente por ID' })
  @ApiResponse({ status: 200, description: 'Paciente encontrado.' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pacientesService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un paciente existente' })
  update(@Param('id') id: string, @Body() updatePacienteDto: UpdatePacienteDto, @CurrentUser() user: any) {
    return this.pacientesService.update(id, updatePacienteDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un paciente' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pacientesService.remove(id, user.userId);
  }
}
