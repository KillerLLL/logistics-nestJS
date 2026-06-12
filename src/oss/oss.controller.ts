// ============================================================
// oss.controller.ts — 文件上传控制器
//   POST /sys/oss/file/imgUpload  — 通用图片上传（uni.uploadFile）
//     字段名：file
//     返回：{ id, url }
// ============================================================

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OssService } from './oss.service';
import { Result } from '../common/result';

@ApiTags('文件上传')
@ApiBearerAuth('access-token')
@Controller('sys/oss/file')
export class OssController {
  constructor(private readonly ossService: OssService) {}

  @ApiOperation({ summary: '图片上传（uni.uploadFile，字段名 file）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @Post('imgUpload')
  @UseInterceptors(FileInterceptor('file'))
  async imgUpload(
    @UploadedFile() file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    } | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('未收到文件');
    }
    const result = await this.ossService.saveImage(file.buffer, file.originalname, file.mimetype);
    return Result.ok(result, '上传成功');
  }
}
