import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('estado')
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Chequeo de estado público (sin autenticación).
   * Lo consume el indicador de conexión del frontend para avisar, en lenguaje
   * simple, si el sistema y la base de datos están respondiendo.
   * Siempre responde HTTP 200 e informa el detalle en el campo `baseDatos`,
   * de modo que el frontend pueda distinguir "servidor caído" (la petición
   * falla) de "servidor arriba pero base de datos sin responder".
   */
  // Se expone en dos rutas: `/health` (estándar, lo usa el monitoreo de Render)
  // y `/estado` (la consume el frontend; los bloqueadores de anuncios suelen
  // bloquear rutas llamadas "health", provocando ERR_BLOCKED_BY_CLIENT).
  @Get(['health', 'estado'])
  @ApiOperation({ summary: 'Estado del servidor y de la base de datos' })
  async health(): Promise<{
    servidor: boolean;
    baseDatos: boolean;
    hora: string;
  }> {
    let baseDatos = false;
    try {
      // Consulta mínima: solo confirma que la base de datos contesta.
      await this.prisma.$queryRaw`SELECT 1`;
      baseDatos = true;
    } catch {
      baseDatos = false;
    }

    return {
      servidor: true,
      baseDatos,
      hora: new Date().toISOString(),
    };
  }
}
