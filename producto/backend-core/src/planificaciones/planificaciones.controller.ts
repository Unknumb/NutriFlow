import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { PlanificacionesService } from './planificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('planificaciones')
@UseGuards(JwtAuthGuard)
export class PlanificacionesController {
  constructor(private readonly planificacionesService: PlanificacionesService) {}

  @Post()
  create(@Body() createPlanificacionDto: any, @CurrentUser() user: any) {
    return this.planificacionesService.create(createPlanificacionDto, user.userId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.planificacionesService.findAll(user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.planificacionesService.remove(id, user.userId);
  }
}
