// ============================================================
// user.controller.ts — 用户控制器
//   新主路径：GET /user/info  PATCH /user/profile
//   旧 /sys/* 路由：保留一版，全部 @Deprecated() 标记，下一版删除
// ============================================================

import { Controller, Get, Post, Body, Patch, Param, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  SmsSendDto,
  SmsLoginDto,
  QuickLoginDto,
  MpSetDto,
  UpdateProfileDto,
} from './dto/user.dto';
import { Result } from '../common/result';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('用户模块')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ============== 新主路径 ==============

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '获取当前用户信息' })
  @Get('user/info')
  async getInfo(@CurrentUser() user: JwtPayload) {
    const u = await this.userService.findById(user.sub);
    if (!u) return Result.fail('用户不存在', 404);
    return Result.ok({
      id: u.id,
      username: u.username,
      nickname: u.nickname,
      phone: u.phone,
      avatar: u.avatar,
      role: u.role,
      certStatus: u.certStatus,
      companyName: u.companyName,
      mpOpenid: u.mpOpenid,
    });
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '更新当前用户资料' })
  @Patch('user/profile')
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    const u = await this.userService.updateProfile(user.sub, dto);
    return Result.ok({
      id: u.id,
      username: u.username,
      nickname: u.nickname,
      phone: u.phone,
      avatar: u.avatar,
      role: u.role,
      certStatus: u.certStatus,
    }, '更新成功');
  }

  // ============== 旧 /sys/* 兼容（@Deprecated） ==============

  @Public()
  @ApiOperation({
    summary: '[已弃用] 发送短信验证码 — 请改用 POST /auth/login',
    deprecated: true,
  })
  @Post('sys/sms')
  sendSms(@Body() dto: SmsSendDto) {
    return this.userService.sendSms(dto);
  }

  @Public()
  @ApiOperation({
    summary: '[已弃用] 短信验证码登录 — 请改用 POST /auth/login',
    deprecated: true,
  })
  @Post('sys/smslogin')
  smsLogin(@Body() dto: SmsLoginDto) {
    return this.userService.smsLogin(dto);
  }

  @Public()
  @ApiOperation({
    summary: '[已弃用] 微信快捷登录 — 请改用 POST /wechat/jscode2session',
    deprecated: true,
  })
  @Post('sys/quicklogin')
  quickLogin(@Body() dto: QuickLoginDto) {
    return this.userService.quickLogin(dto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[已弃用] 获取用户信息（X-Access-Token）— 请改用 GET /user/info',
    deprecated: true,
  })
  @Get('sys/user/getUserInfo')
  getUserInfoLegacy(@Req() req: any) {
    return this.userService.getUserInfoByToken(req.headers['x-access-token']);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[已弃用] 退出登录（X-Access-Token）— 请改用 POST /auth/logout',
    deprecated: true,
  })
  @Get('sys/logout')
  logoutLegacy(@Req() req: any) {
    return this.userService.logoutByToken(req.headers['x-access-token']);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[已弃用] 绑定微信 openId — 请改用 POST /wechat/jscode2session 自动绑定',
    deprecated: true,
  })
  @Post('sys/mpSet')
  async mpSetLegacy(@CurrentUser() user: JwtPayload, @Body() dto: MpSetDto) {
    return this.userService.mpSet(user.sub, dto.mpOpenid);
  }
}
