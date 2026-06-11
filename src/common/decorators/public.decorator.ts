// ============================================================
// public.decorator.ts — @Public() 标记路由跳过 JwtAuthGuard
// ============================================================

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
