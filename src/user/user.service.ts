// ============================================================
// user.service.ts — 用户服务层
// 处理登录、注册、Token 等用户相关业务逻辑
// ============================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { SmsSendDto, SmsLoginDto, QuickLoginDto } from './user.dto';
import { Result } from '../common/result';

// 内存中暂存验证码（生产环境用 Redis）
const smsCodes = new Map<string, string>();

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // 发送短信验证码（模拟，控制台输出）
  async sendSms(dto: SmsSendDto) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    smsCodes.set(dto.mobile, code);
    // 模拟发送短信，实际项目调阿里云/腾讯云短信 API
    console.log(`[短信] ${dto.mobile} 验证码: ${code}`);
    return Result.ok(null, '验证码发送成功');
  }

  // 短信验证码登录
  async smsLogin(dto: SmsLoginDto) {
    // 验证码校验（888888 是万能验证码，方便测试）
    const savedCode = smsCodes.get(dto.mobile);
    if (dto.code !== '888888' && (!savedCode || savedCode !== dto.code)) {
      return Result.fail('验证码错误', 400);
    }

    // 查找或创建用户
    let user = await this.userRepo.findOneBy({ phone: dto.mobile });
    if (!user) {
      user = this.userRepo.create({ phone: dto.mobile, nickname: `用户${dto.mobile.slice(-4)}` });
    }

    // 生成 token（简化版，生产环境用 JWT）
    user.token = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await this.userRepo.save(user);

    // 清除验证码
    smsCodes.delete(dto.mobile);

    return Result.ok({
      token: user.token,
      userInfo: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar },
    }, '登录成功');
  }

  // 微信快捷登录（模拟）
  async quickLogin(dto: QuickLoginDto) {
    // 实际项目：用 jsCode 调微信 API 换取 openId
    const mockOpenid = `wx_${dto.jsCode}_${Date.now()}`;

    let user = await this.userRepo.findOneBy({ mpOpenid: mockOpenid });
    if (!user) {
      user = this.userRepo.create({
        phone: '',
        nickname: `微信用户${Date.now().toString(36)}`,
        mpOpenid: mockOpenid,
      });
    }

    user.token = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await this.userRepo.save(user);

    return Result.ok({
      token: user.token,
      userInfo: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar },
    }, '登录成功');
  }

  // 获取用户信息（通过 token 查找）
  async getUserInfo(token: string) {
    const user = await this.userRepo.findOneBy({ token });
    if (!user) {
      return Result.fail('用户不存在或未登录', 401);
    }
    return Result.ok({
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      companyName: user.companyName,
      certStatus: user.certStatus,
      mpOpenid: user.mpOpenid,
    });
  }

  // 退出登录（清除 token）
  async logout(token: string) {
    const user = await this.userRepo.findOneBy({ token });
    if (user) {
      user.token = '';
      await this.userRepo.save(user);
    }
    return Result.ok(null, '退出成功');
  }

  // 绑定微信 openId
  async mpSet(userId: number, mpOpenid: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      return Result.fail('用户不存在', 404);
    }
    user.mpOpenid = mpOpenid;
    await this.userRepo.save(user);
    return Result.ok(null, '绑定成功');
  }
}
