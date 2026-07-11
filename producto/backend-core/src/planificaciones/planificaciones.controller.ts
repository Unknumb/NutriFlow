import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PlanificacionesService } from './planificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthUser,
} from '../auth/decorators/current-user.decorator';

import { CreatePlanificacionDto } from './dto/create-planificacion.dto';
import { UpdatePlanificacionDto } from './dto/update-planificacion.dto';

@Controller('planificaciones')
@UseGuards(JwtAuthGuard)
export class PlanificacionesController {
  constructor(
    private readonly planificacionesService: PlanificacionesService,
  ) {}

  @Post()
  create(
    @Body() createPlanificacionDto: CreatePlanificacionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.planificacionesService.create(
      createPlanificacionDto,
      user.userId,
    );
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.planificacionesService.findAll(user.userId);
  }

  @Patch(':id/activa')
  setActiva(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.planificacionesService.setActiva(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlanificacionDto: UpdatePlanificacionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.planificacionesService.update(
      id,
      updatePlanificacionDto,
      user.userId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.planificacionesService.remove(id, user.userId);
  }
}
