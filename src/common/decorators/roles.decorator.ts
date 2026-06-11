// ============================================================
// roles.decorator.ts — @Roles('admin', 'driver', ...) 元数据
// 与 RolesGuard 配合控制角色级访问
// ============================================================

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../user/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
