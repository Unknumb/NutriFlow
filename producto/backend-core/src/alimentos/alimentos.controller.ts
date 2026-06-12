// backend-core/src/alimentos/alimentos.controller.ts
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AlimentosService } from './alimentos.service';
import { CreateAlimentoDto } from './dto/create-alimento.dto';
import { QueryAlimentosDto } from './dto/query-alimentos.dto';

@ApiTags('Alimentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alimentos')
export class AlimentosController {
  constructor(private readonly alimentosService: AlimentosService) {}

  @Get()
  @ApiOperation({
    summary:
      'Buscar alimentos del catálogo (insensible a acentos, prefijo primero), paginado con total',
  })
  buscar(@Query() query: QueryAlimentosDto) {
    return this.alimentosService.buscar(query);
  }

  @Get('categorias')
  @ApiOperation({ summary: 'Listar categorías distintas del catálogo de alimentos' })
  categorias() {
    return this.alimentosService.categorias();
  }

  @Post()
  @ApiOperation({ summary: 'Crear un alimento nuevo en el catálogo (valores por 100 g)' })
  @ApiResponse({ status: 201, description: 'Alimento creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o categoría inexistente.' })
  @ApiResponse({ status: 409, description: 'Ya existe un alimento con ese nombre y marca.' })
  crear(@Body() createAlimentoDto: CreateAlimentoDto) {
    return this.alimentosService.crear(createAlimentoDto);
  }
}
