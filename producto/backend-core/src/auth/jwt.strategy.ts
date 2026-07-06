import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import { AuthUser } from './decorators/current-user.decorator';

/** Claims relevantes del JWT de Supabase (ES256). */
interface SupabaseJwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  aal?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    if (!supabaseUrl) {
      throw new Error(
        'FATAL ERROR: SUPABASE_URL is not defined in the environment variables.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Supabase firma los JWT de usuario con claves asimétricas (ES256).
      // Validamos localmente con la clave pública del JWKS del proyecto:
      // se cachea (sin round-trip por request), soporta rotación de claves,
      // y nos permite leer claims como `aal` directamente del token.
      // Restringimos a ES256 para evitar ataques de confusión de algoritmo.
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      }),
      algorithms: ['ES256'],
    });
  }

  validate(payload: SupabaseJwtPayload): AuthUser {
    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido o sin ID de usuario');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      aal: payload.aal,
    };
  }
}
