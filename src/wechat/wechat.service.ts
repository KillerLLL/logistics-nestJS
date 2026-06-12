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

  // ---------- 微信一键登录（支持同时绑定手机号） ----------
  async jsCodeLogin(jsCode: string, ip: string, phoneCode?: string): Promise<JsCodeLoginResult> {
    const { openid, unionid, sessionKey } = await this.wxClient.exchangeJsCode(jsCode);

    let user = await this.userRepo.findOne({ where: { mpOpenid: openid } });
    let isNew = false;
    if (!user) {
      isNew = true;
      // 默认昵称 = `用户${openid后4位}`（没有手机号时）；bindPhone 时会覆写成 `用户${phone后4位}`
      const tail4 =
        (openid || '').slice(-4) ||
        String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      user = this.userRepo.create({
        mpOpenid: openid,
        mpUnionid: unionid,
        nickname: `用户${tail4}`,
        realname: `用户${tail4}`,
        role: 'shipper',
        status: 1,
        certStatus: '0',
        compCompanyStatus: 66,
      });
      await this.userRepo.save(user);
    } else if (unionid && !user.mpUnionid) {
      user.mpUnionid = unionid;
      await this.userRepo.save(user);
    }

    // 如果前端传了 phoneCode（getPhoneNumber 的 code），直接绑定手机号
    if (phoneCode) {
      try {
        const phone = await this.wxClient.getPhoneByCode(phoneCode);
        if (/^1\d{10}$/.test(phone)) {
          user.phone = phone;
          user.nickname = `用户${phone.slice(-4)}`;
          user.realname = `用户${phone.slice(-4)}`;
          await this.userRepo.save(user);
        }
      } catch (e) {
        // 手机号获取失败不阻断登录流程
        console.warn('[WechatService] getPhoneByCode failed:', (e as Error).message);
      }
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
    // 同步覆写昵称和真实姓名为 `用户${phone后4位}`（前端展示习惯）
    user.nickname = `用户${phone.slice(-4)}`;
    user.realname = `用户${phone.slice(-4)}`;
    await this.userRepo.save(user);
    return {
      phone,
      userInfo: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar },
    };
  }
}
