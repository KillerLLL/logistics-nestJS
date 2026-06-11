// ============================================================
// auth.middleware.ts — Token 验证中间件
// 从请求头 X-Access-Token 取 token，验证并注入用户信息
// 前端 http.ts 里就是通过这个请求头带 token 的
// ============================================================

import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Result } from '../common/result';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async use(req: any, res: any, next: () => void) {
    const token = req.headers['x-access-token'];

    // 没有 token 的请求直接放行（比如登录、发短信不需要登录）
    if (!token) {
      next();
      return;
    }

    // 通过 token 查找用户
    const user = await this.userRepo.findOneBy({ token });
    if (user) {
      // 把用户信息挂到 req 上，后续 Controller 可以直接用
      req.currentUser = user;
    }

    next();
  }
}
