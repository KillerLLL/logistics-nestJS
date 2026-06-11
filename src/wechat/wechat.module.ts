// ============================================================
// wechat.module.ts — 微信一键登录模块
// ============================================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';
import { WechatService } from './wechat.service';
import { WechatController } from './wechat.controller';
import { WxMpClient } from './wx-mp.client';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [WechatController],
  providers: [WechatService, WxMpClient],
  exports: [WechatService, WxMpClient],
})
export class WechatModule {}
