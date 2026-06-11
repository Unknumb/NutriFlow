import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';

@Module({
  imports: [HttpModule],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
