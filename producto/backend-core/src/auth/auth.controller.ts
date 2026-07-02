import {
  Controller,
  Post,
  Body,
  Ip,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { createClient } from '@supabase/supabase-js';
import { LoginDto } from './dto/login.dto';
import { sanitizeForLog } from '../common/utils/log.util';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  // Logger de auditoría: registra el resultado de cada intento de login (email
  // + IP), nunca la contraseña ni el token. Alimenta el análisis de logs / SIEM
  // y la detección de abuso (intentos fallidos repetidos desde una IP).
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly configService: ConfigService) {}

  // Límite estricto anti fuerza bruta: 5 intentos por minuto y por IP.
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión con Supabase para obtener un Access Token',
  })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() loginDto: LoginDto, @Ip() ip: string) {
    // La presencia de estas variables está garantizada por la validación de
    // entorno al arrancar (src/config/env.validation.ts), por eso ya no se
    // comprueba aquí manualmente.
    const supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_ANON_KEY')!,
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error || !data.session) {
      this.logger.warn(
        `Login fallido para "${sanitizeForLog(loginDto.email)}" desde IP ${ip}: ${error?.message ?? 'sin sesión'}`,
      );
      throw new UnauthorizedException(
        error?.message || 'Error al iniciar sesión',
      );
    }

    this.logger.log(`Login exitoso: usuario ${data.user.id} desde IP ${ip}`);

    return {
      access_token: data.session.access_token,
      expires_in: data.session.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  }
}
