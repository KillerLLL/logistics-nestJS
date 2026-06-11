// ============================================================
// user.dto.ts — 用户模块请求参数类型
// ============================================================

import { ApiProperty } from '@nestjs/swagger';

// 发送短信验证码
export class SmsSendDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  mobile: string;

  @ApiProperty({ description: '短信类型', example: '1' })
  smsmode: string;
}

// 短信验证码登录
export class SmsLoginDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  mobile: string;

  @ApiProperty({ description: '验证码', example: '123456' })
  code: string;

  @ApiProperty({ description: '登录类型', example: '1' })
  type: string;
}

// 微信快捷登录
export class QuickLoginDto {
  @ApiProperty({ description: '微信jsCode' })
  jsCode: string;

  @ApiProperty({ description: '微信openCode' })
  openCode: string;

  @ApiProperty({ description: '登录类型', example: '1' })
  type: string;
}

// 绑定微信 openId
export class MpSetDto {
  @ApiProperty({ description: '微信openId' })
  mpOpenid: string;
}
