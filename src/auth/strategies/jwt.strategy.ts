// ============================================================
// jwt.strategy.ts — passport-jwt 验签策略
// 从以下 header 之一解析 token（按优先级）：
//   1. Authorization: Bearer <token>     — 标准约定
//   2. X-Access-Token: <token>           — 前端 uniapp http 拦截器注入
// 校验签名/过期，注入 req.user
// ============================================================

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { User } from '../../user/user.entity';

export interface JwtPayload {
  sub: string;
  username?: string;
  role: string;
  jwtVersion: number;
}

function readHeaderValue(v: string | string[] | undefined): string | null {
  if (typeof v === 'string' && v.length > 0) return v;
  if (Array.isArray(v) && typeof v[0] === 'string' && v[0].length > 0) return v[0];
  return null;
}

function extractToken(req: Request): string | null {
  if (!req || !req.headers) return null;
  // 1) Authorization: Bearer <token>（标准约定）
  const auth = readHeaderValue(req.headers['authorization']);
  if (auth) {
    const match = auth.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1].trim();
  }
  // 2) X-Access-Token: <token>（前端 uniapp http 拦截器注入）
  const xAccess = readHeaderValue(req.headers['x-access-token']);
  if (xAccess) return xAccess.trim();
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractToken,
        ExtractJwt.fromAuthHeaderAsBearerToken(), // 兜底（理论上 extractToken 已覆盖）
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret') || 'change-me',
    });
  }

  // 验签通过后调用；payload 入参；返回值挂到 req.user
  async validate(payload: JwtPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException('token 无效');
    }
    // 验证 jwtVersion 是否一致（实现主动踢出）
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || user.status !== 1) {
      throw new UnauthorizedException('用户不存在或已封禁');
    }
    if (user.jwtVersion !== payload.jwtVersion) {
      throw new UnauthorizedException('token 已被踢出，请重新登录');
    }
    return {
      sub: user.id,
      username: user.username,
      role: user.role,
      jwtVersion: user.jwtVersion,
    };
  }
}
