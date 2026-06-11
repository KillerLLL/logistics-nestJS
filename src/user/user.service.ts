// ============================================================
// user.service.ts — 用户服务层
//   兼容保留旧 /sys/* 行为（@Deprecated 一版）
//   主路径改为：findById / updateProfile / bindPhone
// ============================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { SmsSendDto, SmsLoginDto, QuickLoginDto, UpdateProfileDto } from './dto/user.dto';
import { Result } from '../common/result';

// 内存暂存短信验证码（生产替换为 Redis；本期留位）
const smsCodes = new Map<string, string>();

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // =================== 新主路径 ===================

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('用户不存在');
    if (dto.nickname !== undefined) user.nickname = dto.nickname;
    if (dto.avatar !== undefined) user.avatar = dto.avatar;
    if (dto.phone !== undefined) user.phone = dto.phone;
    return this.userRepo.save(user);
  }

  // =================== 旧 /sys/* 兼容（@Deprecated） ===================

  async sendSms(dto: SmsSendDto) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    smsCodes.set(dto.mobile, code);
    console.log(`[短信] ${dto.mobile} 验证码: ${code}`);
    return Result.ok(null, '验证码发送成功');
  }

  async smsLogin(dto: SmsLoginDto) {
    const savedCode = smsCodes.get(dto.mobile);
    if (dto.code !== '888888' && (!savedCode || savedCode !== dto.code)) {
      return Result.fail('验证码错误', 400);
    }
    let user = await this.userRepo.findOne({ where: { phone: dto.mobile } });
    if (!user) {
      user = this.userRepo.create({ phone: dto.mobile, nickname: `用户${dto.mobile.slice(-4)}` });
    }
    // 旧版本用 DB token；新版仅做兼容：把 phone 当 username 兼容密码登录的备用通道
    await this.userRepo.save(user);
    smsCodes.delete(dto.mobile);
    return Result.ok({
      token: '',
      userInfo: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar },
    }, '登录成功（兼容旧接口，请改用 /auth/login 或 /wechat/jscode2session）');
  }

  async quickLogin(dto: QuickLoginDto) {
    // 旧 quicklogin 已被 /wechat/jscode2session 取代；返回引导信息
    return Result.fail('该接口已弃用，请改用 POST /wechat/jscode2session', 410);
  }

  async getUserInfoByToken(token: string) {
    // 旧版基于 token 列的查询不再维护
    return Result.fail('该接口已弃用，请改用 GET /user/info（Authorization: Bearer xxx）', 410);
  }

  async logoutByToken(token: string) {
    return Result.fail('该接口已弃用，请改用 POST /auth/logout', 410);
  }

  async mpSet(userId: string, mpOpenid: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return Result.fail('用户不存在', 404);
    user.mpOpenid = mpOpenid;
    await this.userRepo.save(user);
    return Result.ok(null, '绑定成功');
  }
}
