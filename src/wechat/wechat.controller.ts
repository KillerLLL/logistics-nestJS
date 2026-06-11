// ============================================================
// wechat.controller.ts — 微信一键登录 + 手机号回填
//   POST /logistics-boot/wechat/jscode2session
//   POST /logistics-boot/wechat/phone
// ============================================================

import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { WechatService } from './wechat.service';
import { WxMpClient } from './wx-mp.client';
import { JsCodeDto, PhoneDto } from './dto/wechat.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Result } from '../common/result';

@ApiTags('微信一键登录')
@Controller('wechat')
export class WechatController {
  constructor(
    private readonly wechatService: WechatService,
    private readonly wxClient: WxMpClient,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'jsCode 换 JWT（首次登录自动建账号）' })
  @Post('jscode2session')
  async jscode2session(@Body() dto: JsCodeDto, @Req() req: any) {
    const data = await this.wechatService.jsCodeLogin(dto.jsCode, req.ip);
    return Result.ok(data, data.isNew ? '注册并登录成功' : '登录成功');
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '回填手机号（getPhoneNumber 加密数据）' })
  @Post('phone')
  async phone(@CurrentUser() user: JwtPayload, @Body() dto: PhoneDto) {
    let sessionKey = '';
    if (dto.code) {
      const r = await this.wxClient.exchangeJsCode(dto.code);
      sessionKey = r.sessionKey;
    }
    const data = await this.wechatService.bindPhone(
      user.sub,
      sessionKey,
      dto.encryptedData,
      dto.iv,
    );
    return Result.ok(data, '手机号绑定成功');
  }
}
