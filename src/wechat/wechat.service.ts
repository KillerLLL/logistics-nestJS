// ============================================================
// wechat.service.ts — 微信一键登录 / 手机号回填业务编排
// ============================================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { AuthService, LoginResult } from '../auth/auth.service';
import { WxMpClient } from './wx-mp.client';

export interface JsCodeLoginResult extends LoginResult {
  isNew: boolean;
}

@Injectable()
export class WechatService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly authService: AuthService,
    private readonly wxClient: WxMpClient,
  ) {}

  // ---------- 微信一键登录 ----------
  async jsCodeLogin(jsCode: string, ip: string): Promise<JsCodeLoginResult> {
    const { openid, unionid, sessionKey } = await this.wxClient.exchangeJsCode(jsCode);

    let user = await this.userRepo.findOne({ where: { mpOpenid: openid } });
    let isNew = false;
    if (!user) {
      isNew = true;
      user = this.userRepo.create({
        mpOpenid: openid,
        mpUnionid: unionid,
        nickname: `微信用户${(openid || '').slice(-4) || Math.floor(Math.random() * 10000)}`,
        role: 'shipper',
        status: 1,
        certStatus: '0',
      });
      await this.userRepo.save(user);
    } else if (unionid && !user.mpUnionid) {
      user.mpUnionid = unionid;
      await this.userRepo.save(user);
    }

    const base = await this.authService['issueTokensAndPersist'](user, ip);
    return { ...base, isNew };
  }

  // ---------- 已登录用户回填手机号 ----------
  async bindPhone(
    userId: string,
    sessionKey: string,
    encryptedData: string,
    iv: string,
  ): Promise<{ phone: string; userInfo: Partial<User> }> {
    const phone = this.wxClient.decryptPhoneNumber(sessionKey, encryptedData, iv);
    if (!/^1\d{10}$/.test(phone)) {
      throw new UnauthorizedException('手机号解析失败');
    }
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    user.phone = phone;
    await this.userRepo.save(user);
    return {
      phone,
      userInfo: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar },
    };
  }
}
