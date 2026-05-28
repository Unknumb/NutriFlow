import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado o formato inválido');
    }

    const token = authHeader.split(' ')[1];

    try {
      const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: process.env.SUPABASE_ANON_KEY as string,
        },
      });

      if (!response.ok) {
        throw new UnauthorizedException('Token inválido, expirado o revocado');
      }

      const user = await response.json();

      request.user = {
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
      };

      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new UnauthorizedException('Error al validar el token');
    }
  }
}
