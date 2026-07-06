import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/** Identidad del usuario autenticado, extraída del JWT por JwtStrategy.validate. */
export interface AuthUser {
  userId: string;
  email?: string;
  role?: string;
  aal?: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: AuthUser }>();
    return request.user;
  },
);
