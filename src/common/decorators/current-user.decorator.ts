// ============================================================
// current-user.decorator.ts — @CurrentUser() 注入 req.user
// ============================================================

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: string; // user id
  username?: string;
  role: string;
  jwtVersion: number;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as JwtPayload;
  },
);
