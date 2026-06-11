// ============================================================
// wechat.controller.ts — 微信一键登录 + 手机号回填
//   POST /logistics-boot/wechat/jscode2session
//   POST /logistics-boot/wechat/phone
// ============================================================

import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { WechatService } from './wechat.service';
import { JsCodeDto, PhoneDto } from './dto/wechat.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Result } from '../common/result';

@ApiTags('微信一键登录')
@Controller('wechat')
export class WechatController {
  constructor(private readonly wechatService: WechatService) {}

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
    // 简化版：实际生产应该用本次请求上下文中的 sessionKey；当前直接用 dto.code 再换一次
    // 这里以 dto.code 重新走 jscode2session 拿 sessionKey；如未传 code，则从入参 encryptedData 中解码
    const data = await this.wechatService.bindPhone(
      user.sub,
      dto.code ? (await this.wechatService['wxClient'].exchangeJsCode(dto.code)).sessionKey : '',
      dto.encryptedData,
      dto.iv,
    );
    return Result.ok(data, '手机号绑定成功');
  }
}
