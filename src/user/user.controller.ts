// ============================================================
// user.controller.ts — 用户控制器
//   前端主路径：POST /user/login  GET /user/info  POST /user/logout
//   前端一键登录：POST /sys/quicklogin（对接新微信登录逻辑）
//   旧 /sys/* 路由：保留一版 deprecated
// ============================================================

import { Controller, Get, Post, Body, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { WechatService } from '../wechat/wechat.service';
import {
  SmsSendDto,
  SmsLoginDto,
  QuickLoginDto,
  MpSetDto,
  UpdateProfileDto,
} from './dto/user.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { Result } from '../common/result';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('用户模块')
@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly wechatService: WechatService,
  ) {}

  // ============== 前端主路径（对齐 request.js） ==============

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: '账号密码登录' })
  @Post('user/login')
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const data = await this.authService.login(dto.username, dto.password, req.ip);
    return Result.ok(data, '登录成功');
  }

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
  @ApiOperation({
    summary: '[对齐前端] 拉取用户+企业信息 — 对应 apiFetchUserInfo()',
  })
  @Get('sys/user/getUserInfo')
  async fetchUserInfo(@CurrentUser() user: JwtPayload) {
    const u = await this.userService.findById(user.sub);
    if (!u) return Result.fail('用户不存在', 404);
    return Result.ok({
      userInfo: this.userService.toUserInfoVo(u),
      companyInfo: this.userService.toCompanyInfoVo(u),
    });
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '退出登录' })
  @Post('user/logout')
  async logout(@CurrentUser() user: JwtPayload, @Req() req: any) {
    await this.authService.logout(user.sub, req.body?.refreshToken);
    return Result.ok({ ok: true }, '退出成功');
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

  // ============== 前端一键登录（旧路径对接新逻辑） ==============

  @Public()
  @ApiOperation({ summary: '微信一键登录' })
  @Post('sys/quicklogin')
  async quickLogin(@Body() dto: QuickLoginDto, @Req() req: any) {
    // 前端传的 openCode 是 wx.login 返回的真实 jsCode
    const jsCode = dto.openCode || dto.jsCode;
    const result = await this.wechatService.jsCodeLogin(jsCode, req.ip);
    return Result.ok({
      token: result.token,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      userInfo: result.userInfo,
    }, result.isNew ? '注册并登录成功' : '登录成功');
  }

  // ============== 旧 /sys/* 兼容（@Deprecated） ==============

  @Public()
  @ApiOperation({
    summary: '[已弃用] 发送短信验证码 — 请改用 POST /user/login',
    deprecated: true,
  })
  @Post('sys/sms')
  sendSms(@Body() dto: SmsSendDto) {
    return this.userService.sendSms(dto);
  }

  @Public()
  @ApiOperation({
    summary: '[已弃用] 短信验证码登录 — 请改用 POST /user/login',
    deprecated: true,
  })
  @Post('sys/smslogin')
  smsLogin(@Body() dto: SmsLoginDto) {
    return this.userService.smsLogin(dto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[已弃用] 退出登录 — 请改用 POST /user/logout',
    deprecated: true,
  })
  @Get('sys/logout')
  logoutLegacy(@Req() req: any) {
    return this.userService.logoutByToken(req.headers['x-access-token']);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[已弃用] 绑定微信 openId — 请改用 POST /wechat/jscode2session',
    deprecated: true,
  })
  @Post('sys/mpSet')
  async mpSetLegacy(@CurrentUser() user: JwtPayload, @Body() dto: MpSetDto) {
    return this.userService.mpSet(user.sub, dto.mpOpenid);
  }
}
