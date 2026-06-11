// ============================================================
// user.dto.ts — 用户模块请求参数类型
//   旧 DTO（sms* / quicklogin / mpSet）：保留一版以兼容 /sys/* 老接口
//   新 DTO（updateProfile）：对齐前端契约
// ============================================================

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

// ===== 旧 DTO（@Deprecated：保留至下一版后下线） =====

export class SmsSendDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  mobile: string;

  @ApiProperty({ description: '短信类型', example: '1' })
  smsmode: string;
}

export class SmsLoginDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  mobile: string;

  @ApiProperty({ description: '验证码', example: '123456' })
  code: string;

  @ApiProperty({ description: '登录类型', example: '1' })
  type: string;
}

export class QuickLoginDto {
  @ApiProperty({ description: '微信jsCode' })
  @IsString()
  jsCode: string;

  @ApiProperty({ description: '微信openCode（wx.login 返回的 code）' })
  @IsString()
  openCode: string;

  @ApiProperty({ description: '登录类型', example: '1' })
  @IsString()
  type: string;

  @ApiProperty({ description: '邀请码', required: false })
  @IsOptional()
  @IsString()
  invitationCode?: string;
}

export class MpSetDto {
  @ApiProperty({ description: '微信openId' })
  mpOpenid: string;
}

// ===== 新 DTO =====

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
