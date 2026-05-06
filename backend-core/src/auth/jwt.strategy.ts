import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Supabase ahora usa claves asimétricas (ES256/RS256) en proyectos recientes, 
      // por lo que debemos obtener la llave pública dinámica (JWKS) en lugar del secreto simétrico.
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.SUPABASE_URL}/auth/v1/jwks`,
      }),
      algorithms: ['RS256', 'ES256', 'HS256'],
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido o sin ID de usuario');
    }
    
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
