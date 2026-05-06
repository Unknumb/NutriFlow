import { Module } from '@nestjs/common';
import { PautasService } from './pautas.service';
import { PautasController } from './pautas.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PautasController],
  providers: [PautasService],
})
export class PautasModule {}
