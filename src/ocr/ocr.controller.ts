// ============================================================
// ocr.controller.ts — OCR 识别控制器
//   POST /tencent/ocr/bizLicense       — 营业执照识别
//   POST /tencent/ocr/nologin/idCard   — 身份证识别
//   POST /tencent/ocr/roadTransport    — 道路运输证识别
// ============================================================

import { Controller, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OcrService } from './ocr.service';
import { OcrBizLicenseDto, OcrIdCardDto, OcrUrlDto } from './dto/ocr.dto';
import { Result } from '../common/result';

@ApiTags('OCR 识别')
@ApiBearerAuth('access-token')
@Controller('tencent/ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @ApiOperation({ summary: '营业执照 OCR 识别' })
  @Post('bizLicense')
  async bizLicense(@Body() dto: OcrBizLicenseDto) {
    const data = await this.ocrService.recognizeBizLicense(dto.url);
    return Result.ok(data);
  }

  @ApiOperation({ summary: '身份证 OCR 识别' })
  @Post('nologin/idCard')
  async idCard(@Body() dto: OcrIdCardDto) {
    const data = await this.ocrService.recognizeIdCard(dto.url, dto.cardSide);
    return Result.ok(data);
  }

  @ApiOperation({ summary: '道路运输证 OCR 识别' })
  @Post('roadTransport')
  async roadTransport(@Body() dto: OcrUrlDto) {
    const data = await this.ocrService.recognizeRoadTransport(dto.url);
    return Result.ok(data);
  }
}
