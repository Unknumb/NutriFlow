// backend-core/src/menus/menus.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisService } from 'src/redis/redis.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerarMenuDto } from './dto/generar-menu.dto';
import { derivarRestriccionesDePaciente } from './restricciones.constants';

@Injectable()
export class MenusService {
  private readonly logger = new Logger(MenusService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async generarSugerencias(dto: GenerarMenuDto, nutricionistaId: string) {
    // Payload RESUELTO hacia backend-math: si viene paciente_id y el cliente
    // no envió restricciones/rechazos explícitos, se derivan de la ficha del
    // paciente (lo enviado en el request siempre manda sobre lo derivado).
    const payload = {
      porciones_disponibles: dto.porciones_disponibles,
      restricciones_dieteticas: dto.restricciones_dieteticas ?? [],
      alimentos_rechazados: dto.alimentos_rechazados ?? [],
      preferencias_texto: dto.preferencias_texto,
      nutricionista_id: nutricionistaId,
    };

    if (dto.paciente_id) {
      const paciente = await this.prisma.pacientes.findFirst({
        where: { id: dto.paciente_id, nutricionista_id: nutricionistaId },
        select: { alergias: true, preferencias_alimentarias: true },
      });
      if (!paciente) {
        throw new NotFoundException(
          `Paciente con ID ${dto.paciente_id} no encontrado o no tienes permisos de acceso`,
        );
      }
      if (dto.restricciones_dieteticas === undefined) {
        payload.restricciones_dieteticas = derivarRestriccionesDePaciente([
          ...paciente.alergias,
          ...paciente.preferencias_alimentarias,
        ]);
      }
    }

    // La clave se construye sobre el payload RESUELTO (no el DTO crudo) para
    // que cambios en la ficha del paciente no sirvan resultados obsoletos.
    // Mantiene el prefijo `menus:` para la invalidación global desde
    // PreparacionesService y AlimentosService (menus:*).
    const cacheKey = `menus:${nutricionistaId}:${JSON.stringify(payload)}`;
    const cached = await this.redisService.client.get(cacheKey);
    if (cached) return cached;

    const url = `${process.env.MATH_ENGINE_URL ?? 'http://localhost:8000'}/api/menus/generar-menu`;
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<Record<string, unknown>>(url, payload),
      );
      await this.redisService.client.set(cacheKey, data, { ex: 7200 }); // 2 horas
      return data;
    } catch (error) {
      this.logger.error(
        'Error al generar menú desde backend-math',
        error as Error,
      );
      throw new InternalServerErrorException(
        'Error al generar el menú. Verifica el backend matemático.',
      );
    }
  }
}
