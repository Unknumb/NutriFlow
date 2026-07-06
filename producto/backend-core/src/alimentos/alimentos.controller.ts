// backend-core/src/alimentos/alimentos.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AlimentosService } from './alimentos.service';
import { CreateAlimentoDto } from './dto/create-alimento.dto';
import { UpdateAlimentoDto } from './dto/update-alimento.dto';
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
  @ApiOperation({
    summary: 'Listar categorías distintas del catálogo de alimentos',
  })
  categorias() {
    return this.alimentosService.categorias();
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un alimento nuevo en el catálogo (valores por 100 g)',
  })
  @ApiResponse({ status: 201, description: 'Alimento creado exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o categoría inexistente.',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un alimento con ese nombre y marca.',
  })
  crear(@Body() createAlimentoDto: CreateAlimentoDto) {
    return this.alimentosService.crear(createAlimentoDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un alimento (incluye mover de categoría)',
  })
  @ApiResponse({ status: 200, description: 'Alimento actualizado.' })
  @ApiResponse({ status: 404, description: 'Alimento no encontrado.' })
  @ApiResponse({ status: 409, description: 'Conflicto de nombre y marca.' })
  actualizar(
    @Param('id') id: string,
    @Body() updateAlimentoDto: UpdateAlimentoDto,
  ) {
    return this.alimentosService.actualizar(id, updateAlimentoDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un alimento del catálogo (si no está en uso)',
  })
  @ApiResponse({ status: 200, description: 'Alimento eliminado.' })
  @ApiResponse({ status: 404, description: 'Alimento no encontrado.' })
  @ApiResponse({
    status: 409,
    description: 'El alimento está en uso en preparaciones o pautas.',
  })
  eliminar(@Param('id') id: string) {
    return this.alimentosService.eliminar(id);
  }
}
