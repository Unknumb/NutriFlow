import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PautasService } from './pautas.service';
import { CreatePautaDto } from './dto/create-pauta.dto';
import { UpdatePautaDto } from './dto/update-pauta.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Pautas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // 🔒 Todo el controlador protegido
@Controller('pautas')
export class PautasController {
  constructor(private readonly pautasService: PautasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva pauta nutricional' })
  @ApiResponse({ status: 201, description: 'La pauta fue creada exitosamente.' })
  create(@Body() createPautaDto: CreatePautaDto, @CurrentUser() user: any) {
    // 🛡️ Inyectamos automáticamente el nutricionista_id del token
    return this.pautasService.create(createPautaDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las pautas del nutricionista logueado' })
  findAll(@CurrentUser() user: any) {
    // 🛡️ Pasamos el ID del nutricionista para filtrar en el Service
    return this.pautasService.findAllByNutricionista(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una pauta específica por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pautasService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una pauta' })
  update(
    @Param('id') id: string, 
    @Body() updatePautaDto: UpdatePautaDto, 
    @CurrentUser() user: any
  ) {
    return this.pautasService.update(id, updatePautaDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una pauta' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pautasService.remove(id, user.userId);
  }
}
