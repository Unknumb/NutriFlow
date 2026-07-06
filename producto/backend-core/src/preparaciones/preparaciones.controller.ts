// backend-core/src/preparaciones/preparaciones.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthUser,
} from '../auth/decorators/current-user.decorator';
import { PreparacionesService } from './preparaciones.service';
import { CreatePreparacionDto } from './dto/create-preparacion.dto';
import { UpdatePreparacionDto } from './dto/update-preparacion.dto';

@ApiTags('Preparaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('preparaciones')
export class PreparacionesController {
  constructor(private readonly preparacionesService: PreparacionesService) {}

  @Get()
  @ApiOperation({
    summary:
      'Listar preparaciones del nutricionista + las del sistema, con ingredientes y totales nutricionales',
  })
  findAll(@CurrentUser() user: AuthUser) {
    return this.preparacionesService.findAll(user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una preparación con sus ingredientes' })
  @ApiResponse({ status: 201, description: 'Preparación creada exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o alimentos inexistentes.',
  })
  create(
    @Body() createPreparacionDto: CreatePreparacionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.preparacionesService.create(createPreparacionDto, user.userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Actualizar una preparación propia (las del sistema son solo lectura)',
  })
  @ApiResponse({
    status: 403,
    description: 'Preparación del sistema, no editable.',
  })
  @ApiResponse({ status: 404, description: 'Preparación no encontrada.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePreparacionDto: UpdatePreparacionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.preparacionesService.update(
      id,
      updatePreparacionDto,
      user.userId,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Eliminar una preparación propia (las del sistema son solo lectura)',
  })
  @ApiResponse({
    status: 403,
    description: 'Preparación del sistema, no eliminable.',
  })
  @ApiResponse({ status: 404, description: 'Preparación no encontrada.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.preparacionesService.remove(id, user.userId);
  }
}
