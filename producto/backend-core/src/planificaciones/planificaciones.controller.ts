import { Controller, Get, Post, Patch, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { PlanificacionesService } from './planificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { CreatePlanificacionDto } from './dto/create-planificacion.dto';

@Controller('planificaciones')
@UseGuards(JwtAuthGuard)
export class PlanificacionesController {
  constructor(private readonly planificacionesService: PlanificacionesService) {}

  @Post()
  create(@Body() createPlanificacionDto: CreatePlanificacionDto, @CurrentUser() user: any) {
    return this.planificacionesService.create(createPlanificacionDto, user.userId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.planificacionesService.findAll(user.userId);
  }

  @Patch(':id/activa')
  setActiva(@Param('id') id: string, @CurrentUser() user: any) {
    return this.planificacionesService.setActiva(id, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.planificacionesService.remove(id, user.userId);
  }
}
