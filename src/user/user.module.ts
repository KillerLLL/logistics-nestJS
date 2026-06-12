// ============================================================
// user.module.ts — 用户模块
// 引入 AuthModule + WechatModule 供 UserController 使用
// ============================================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { WechatModule } from '../wechat/wechat.module';
import { UserController } from './user.controller';
import { CompanyController } from './company.controller';
import { UserService } from './user.service';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule, WechatModule],
  controllers: [UserController, CompanyController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
