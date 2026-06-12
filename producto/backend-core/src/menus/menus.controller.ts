import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MenusService } from './menus.service';
import { GenerarMenuDto } from './dto/generar-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Menus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post('generar')
  @ApiOperation({ summary: 'Genera sugerencias de menús consumiendo el backend-math' })
  generarSugerencias(@Body() generarMenuDto: GenerarMenuDto, @CurrentUser() user: any) {
    return this.menusService.generarSugerencias(generarMenuDto, user.userId);
  }
}
