// ============================================================
// oss.service.ts — 文件存储（S3 协议；对接京东云对象存储）
//   京东云 OSS 兼容 AWS S3 API（v4 签名）
//   - 路径规则：{pathPrefix}/yyyy/MM/dd/{uuid}.{ext}
//   - 返回 { id, url }：id 是 16 字节 hex；url 是公网直链
//   - bucket 需设置为「公有读」才能让 url 直接出图
// ============================================================

import { Injectable, Logger, BadRequestException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';

export interface UploadResult {
  id: string;
  url: string;
}

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
]);

@Injectable()
export class OssService implements OnModuleInit {
  private readonly logger = new Logger(OssService.name);
  private s3: S3Client;
  private bucket: string;
  private publicHost: string;
  private pathPrefix: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const accessKeyId = this.config.get<string>('oss.accessKeyId') || '';
    const secretAccessKey = this.config.get<string>('oss.secretAccessKey') || '';
    this.bucket = this.config.get<string>('oss.bucket') || '';
    this.publicHost = (this.config.get<string>('oss.publicHost') || '').replace(/\/$/, '');
    this.pathPrefix = (this.config.get<string>('oss.pathPrefix') || '').replace(/^\/|\/$/g, '');

    this.s3 = new S3Client({
      region: this.config.get<string>('oss.region') || 'cn-east-2',
      endpoint: this.config.get<string>('oss.endpoint'),
      credentials: { accessKeyId, secretAccessKey },
      // 京东云默认 virtual-hosted；forcePathStyle 关掉让签名走 subdomain 模式
      forcePathStyle: false,
    });

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn('[OssService] OSS_ACCESS_KEY_ID / OSS_SECRET_ACCESS_KEY 未配置 — 上传会 403');
    } else {
      this.logger.log(`[OssService] 已初始化 S3 客户端 — endpoint=${this.config.get('oss.endpoint')} bucket=${this.bucket} prefix=${this.pathPrefix}/`);
    }
  }

  /**
   * 上传图片到京东云 OSS
   * @param buffer 文件二进制
   * @param originalName 原始文件名（用于推断扩展名）
   * @param mimeType mime 类型
   */
  async saveImage(buffer: Buffer, originalName: string, mimeType: string): Promise<UploadResult> {
    if (!ALLOWED_MIME.has(mimeType)) {
      throw new BadRequestException(`不支持的图片类型: ${mimeType}`);
    }
    const ext = this.extractExt(originalName, mimeType);
    const id = crypto.randomBytes(16).toString('hex');
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const key = [this.pathPrefix, yyyy, MM, dd, `${id}${ext}`]
      .filter(Boolean)
      .join('/');

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        // 不带 ACL：京东云 bucket 已设「公有读」，per-object ACL 部分兼容实现会拒绝
      }),
    );

    const url = `${this.publicHost}/${key}`;
    this.logger.log(`[OssService] 上传成功: ${key} (${buffer.length} bytes, ${mimeType})`);
    return { id, url };
  }

  private extractExt(originalName: string, mimeType: string): string {
    const fromName = (originalName || '').toLowerCase().match(/\.(jpe?g|png|gif|webp|bmp)$/);
    if (fromName) return fromName[0];
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/bmp': '.bmp',
    };
    return map[mimeType] || '.jpg';
  }
}
