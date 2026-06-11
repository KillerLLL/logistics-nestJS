// ============================================================
// wechat.dto.ts — 微信小程序 DTO
// ============================================================

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class JsCodeDto {
  @ApiProperty({ description: 'wx.login() 返回的 code' })
  @IsString()
  @MinLength(1)
  jsCode: string;

  @ApiProperty({ description: '客户端类型', example: 'mp-weixin', required: false })
  @IsOptional()
  @IsString()
  type?: string;
}

export class PhoneDto {
  @ApiProperty({ description: 'getPhoneNumber 回调的 encryptedData' })
  @IsString()
  encryptedData: string;

  @ApiProperty({ description: 'getPhoneNumber 回调的 iv' })
  @IsString()
  iv: string;

  @ApiProperty({ description: '可选：再次校验的 jsCode', required: false })
  @IsOptional()
  @IsString()
  code?: string;
}
