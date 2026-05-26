import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MenusService } from './menus.service';
import { GenerarMenuDto } from './dto/generar-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Menus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post('generar')
  @ApiOperation({ summary: 'Genera sugerencias de menús consumiendo el backend-math' })
  generarSugerencias(@Body() generarMenuDto: GenerarMenuDto) {
    return this.menusService.generarSugerencias(generarMenuDto);
  }
}
