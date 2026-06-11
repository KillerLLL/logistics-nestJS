// ============================================================
// user.controller.ts — 用户控制器
// 对接前端 api/user.ts 中的 6 个接口
// 全局前缀 logistics-boot 在 main.ts 中设置，这里只写子路径
// ============================================================

import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { UserService } from './user.service';
import { SmsSendDto, SmsLoginDto, QuickLoginDto, MpSetDto } from './user.dto';
import { Result } from '../common/result';

@ApiTags('用户模块')
@Controller('sys')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // POST /logistics-boot/sys/sms — 发送短信验证码
  @ApiOperation({ summary: '发送短信验证码' })
  @Post('sms')
  sendSms(@Body() dto: SmsSendDto) {
    return this.userService.sendSms(dto);
  }

  // POST /logistics-boot/sys/smslogin — 短信验证码登录
  @ApiOperation({ summary: '短信验证码登录' })
  @Post('smslogin')
  smsLogin(@Body() dto: SmsLoginDto) {
    return this.userService.smsLogin(dto);
  }

  // POST /logistics-boot/sys/quicklogin — 微信快捷登录
  @ApiOperation({ summary: '微信快捷登录' })
  @Post('quicklogin')
  quickLogin(@Body() dto: QuickLoginDto) {
    return this.userService.quickLogin(dto);
  }

  // GET /logistics-boot/sys/user/getUserInfo — 获取用户信息
  @ApiHeader({ name: 'X-Access-Token', required: true, description: '登录令牌' })
  @ApiOperation({ summary: '获取用户信息' })
  @Get('user/getUserInfo')
  getUserInfo(@Req() req: any) {
    const token = req.headers['x-access-token'];
    if (!token) return Result.fail('未登录', 401);
    return this.userService.getUserInfo(token);
  }

  // GET /logistics-boot/sys/logout — 退出登录
  @ApiHeader({ name: 'X-Access-Token', required: true, description: '登录令牌' })
  @ApiOperation({ summary: '退出登录' })
  @Get('logout')
  logout(@Req() req: any) {
    const token = req.headers['x-access-token'];
    if (!token) return Result.fail('未登录', 401);
    return this.userService.logout(token);
  }

  // POST /logistics-boot/sys/mpSet — 绑定微信openId
  @ApiHeader({ name: 'X-Access-Token', required: true, description: '登录令牌' })
  @ApiOperation({ summary: '绑定微信openId' })
  @Post('mpSet')
  mpSet(@Req() req: any, @Body() dto: MpSetDto) {
    const token = req.headers['x-access-token'];
    if (!token) return Result.fail('未登录', 401);
    // 从 token 获取用户（中间件已注入）
    const userId = req.currentUser?.id;
    if (!userId) return Result.fail('用户不存在', 401);
    return this.userService.mpSet(userId, dto.mpOpenid);
  }
}
