import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SUPABASE_JWT_SECRET || 'secret', // Debería estar en variables de entorno
    });
  }

  async validate(payload: any) {
    // Supabase coloca el ID del usuario en el campo 'sub'
    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido o sin ID de usuario');
    }
    
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
