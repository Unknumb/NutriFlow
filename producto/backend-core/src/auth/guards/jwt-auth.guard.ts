import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado o formato inválido');
    }

    const token = authHeader.split(' ')[1];
    
    // Instanciar cliente de supabase con variables de entorno
    const supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_ANON_KEY as string
    );

    // getUser verifica el token asimétrico (ES256) directamente con los servidores de Supabase
    // Esto garantiza que la firma es válida y la sesión no ha sido revocada.
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Token inválido, expirado o revocado');
    }

    // Inyectamos el usuario validado en el request
    // Usamos 'userId' para que coincida con lo que espera el decorador @CurrentUser()
    request.user = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return true;
  }
}
