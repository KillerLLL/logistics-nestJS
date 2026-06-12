// ============================================================
// auth.service.ts — 账号密码登录 + JWT 颁发 / 刷新 / 吊销
// 接口签名对齐方案 §5.1
// ============================================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../user/user.entity';
import { Result } from '../common/result';

const BCRYPT_COST = 10;

export interface LoginResult {
  token: string;
  refreshToken: string;
  expiresIn: number;
  userInfo: {
    id: string;
    username: string;
    nickname: string;
    realname: string;
    phone: string;
    avatar: string;
    role: string;
    certStatus: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ---------- 账号密码登录 ----------
  async login(username: string, password: string, ip: string): Promise<LoginResult> {
    const user = await this.userRepo.findOne({ where: [{ username }, { phone: username }] });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('账号或密码错误');
    }
    if (user.status !== 1) {
      throw new UnauthorizedException('账号已被封禁');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('账号或密码错误');
    }
    return this.issueTokensAndPersist(user, ip);
  }

  // ---------- refresh 刷新 ----------
  async refresh(refreshToken: string, ip: string): Promise<LoginResult> {
    const hash = this.hashRefresh(refreshToken);
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('refresh token 失效或过期');
    }
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || user.status !== 1) {
      throw new UnauthorizedException('用户不存在或已封禁');
    }
    if (user.refreshTokenHash !== hash) {
      // 旧的已被轮换或伪造
      throw new UnauthorizedException('refresh token 已被吊销');
    }
    return this.issueTokensAndPersist(user, ip);
  }

  // ---------- 退出登录 ----------
  async logout(userId: string, refreshToken: string | undefined): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;
    // 吊销当前 refresh；并升 jwt_version 让该用户所有 access 失效
    user.refreshTokenHash = null;
    user.jwtVersion = (user.jwtVersion || 0) + 1;
    await this.userRepo.save(user);
  }

  // ---------- 主动踢出（保留方法签名，便于后续接管理端） ----------
  async bumpJwtVersion(userId: string): Promise<void> {
    await this.userRepo.increment({ id: userId }, 'jwtVersion', 1);
  }

  // ---------- 工具：签发双 token 并落库 ----------
  private async issueTokensAndPersist(user: User, ip: string): Promise<LoginResult> {
    const accessSecret = this.config.get<string>('jwt.accessSecret')!;
    const refreshSecret = this.config.get<string>('jwt.refreshSecret')!;
    const accessTtl = this.config.get<string>('jwt.accessTtl') || '2h';
    const refreshTtl = this.config.get<string>('jwt.refreshTtl') || '14d';

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      jwtVersion: user.jwtVersion || 0,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessTtl as any,
    });
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jwtVersion: user.jwtVersion || 0 },
      { secret: refreshSecret, expiresIn: refreshTtl as any },
    );

    user.refreshTokenHash = this.hashRefresh(refreshToken);
    user.lastLoginAt = new Date();
    user.lastLoginIp = ip || '';
    await this.userRepo.save(user);

    return {
      token: accessToken,
      refreshToken,
      expiresIn: this.parseTtlToSeconds(accessTtl),
      userInfo: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        realname: user.realname ?? '',
        phone: user.phone ?? '',
        avatar: user.avatar,
        role: user.role,
        certStatus: user.certStatus,
      },
    };
  }

  // ---------- 工具：hash refresh token（用于持久化比对） ----------
  hashRefresh(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // ---------- 工具：解析 2h / 14d / 7200 这种 TTL 到秒 ----------
  private parseTtlToSeconds(ttl: string): number {
    const m = /^(\d+)\s*(s|m|h|d)?$/.exec(ttl.trim());
    if (!m) return 7200;
    const n = parseInt(m[1], 10);
    switch (m[2]) {
      case 'd':
        return n * 86400;
      case 'h':
        return n * 3600;
      case 'm':
        return n * 60;
      case 's':
      default:
        return n;
    }
  }

  // ---------- 工具：bcrypt 哈希密码（给种子脚本/管理端用） ----------
  static async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_COST);
  }
}
