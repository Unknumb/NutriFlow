import { Module } from '@nestjs/common';
import { PautasService } from './pautas.service';
import { PautasController } from './pautas.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [PautasController],
  providers: [PautasService],
})
export class PautasModule {}
