// ============================================================
// ocr.dto.ts — OCR 模块请求参数
// ============================================================

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional } from 'class-validator';

export class OcrUrlDto {
  @ApiProperty({ description: '图片 URL' })
  @IsString()
  url: string;
}

export class OcrBizLicenseDto extends OcrUrlDto {}

export class OcrIdCardDto extends OcrUrlDto {
  @ApiProperty({ description: '身份证面 FRONT=正面 BACK=背面' })
  @IsString()
  @IsIn(['FRONT', 'BACK'])
  cardSide: 'FRONT' | 'BACK';
}
