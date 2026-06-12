// ============================================================
// ocr.service.ts — 腾讯云 OCR 识别服务
//   使用腾讯云文字识别 API（BizLicense / IDCard / RoadTransport）
//   沙箱模式：未配置密钥时返回 mock 数据
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface OcrBizLicenseResult {
  name?: string;
  regNum?: string;
  person?: string;
  capital?: string;
  address?: string;
  isLongTerm?: boolean;
  startDate?: string;
  endDate?: string;
  error_code?: string;
  error_message?: string;
}

export interface OcrIdCardResult {
  name?: string;
  idNum?: string;
  address?: string;
  validDate?: string;
  startDate?: string;
  endDate?: string;
  error_code?: string;
  error_message?: string;
}

export interface OcrRoadTransportResult {
  plateNo?: string;
  owner?: string;
  roadTransportCertNo?: string;
  validDate?: string;
  startDate?: string;
  endDate?: string;
  error_code?: string;
  error_message?: string;
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private secretId: string;
  private secretKey: string;
  private mockMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.secretId = this.config.get<string>('ocr.tencentSecretId') || '';
    this.secretKey = this.config.get<string>('ocr.tencentSecretKey') || '';
    this.mockMode = !this.secretId || !this.secretKey || this.secretKey.startsWith('__');
    if (this.mockMode) {
      this.logger.warn('[OcrService] OCR 密钥未配置，已启用沙箱 mock 模式');
    } else {
      this.logger.log('[OcrService] 腾讯云 OCR 已初始化');
    }
  }

  /** 营业执照 OCR */
  async recognizeBizLicense(imageUrl: string): Promise<OcrBizLicenseResult> {
    if (this.mockMode) return this.mockBizLicense(imageUrl);
    return this.callTencentOcr('BizLicenseOCR', imageUrl);
  }

  /** 身份证 OCR */
  async recognizeIdCard(imageUrl: string, cardSide: 'FRONT' | 'BACK'): Promise<OcrIdCardResult> {
    if (this.mockMode) return this.mockIdCard(imageUrl, cardSide);
    return this.callTencentOcr('IDCardOCR', imageUrl, { CardSide: cardSide });
  }

  /** 道路运输证 OCR */
  async recognizeRoadTransport(imageUrl: string): Promise<OcrRoadTransportResult> {
    if (this.mockMode) return this.mockRoadTransport(imageUrl);
    return this.callTencentOcr('RoadTransportOCR', imageUrl);
  }

  // =================== 腾讯云 API 调用 ===================

  private async callTencentOcr(
    action: string,
    imageUrl: string,
    extraParams: Record<string, string> = {},
  ): Promise<any> {
    const host = 'ocr.tencentcloudapi.com';
    const service = 'ocr';
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().split('T')[0];

    const payload = JSON.stringify({ ImageUrl: imageUrl, ...extraParams });

    const signedHeaders = 'content-type;host';
    const canonicalRequest = [
      'POST',
      '/',
      '',
      `content-type:application/json; charset=utf-8`,
      `host:${host}`,
      '',
      signedHeaders,
      crypto.createHash('sha256').update(payload).digest('hex'),
    ].join('\n');

    const credentialScope = `${date}/${service}/tc3_request`;
    const stringToSign = [
      'TC3-HMAC-SHA256',
      String(timestamp),
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const secretDate = this.hmacSha256(`TC3${this.secretKey}`, date);
    const secretService = this.hmacSha256(secretDate, service);
    const secretSigning = this.hmacSha256(secretService, 'tc3_request');
    const signature = crypto
      .createHmac('sha256', secretSigning)
      .update(stringToSign)
      .digest('hex');

    const authorization =
      `TC3-HMAC-SHA256 Credential=${this.secretId}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const res = await fetch(`https://${host}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Host: host,
        'X-TC-Action': action,
        'X-TC-Timestamp': String(timestamp),
        'X-TC-Version': '2018-11-19',
        Authorization: authorization,
      },
      body: payload,
    });

    const json = await res.json();
    const data = json.Response;

    if (data.Error) {
      return {
        error_code: data.Error.Code,
        error_message: data.Error.Message,
      };
    }

    return this.mapOcrResult(action, data);
  }

  private mapOcrResult(action: string, data: any): any {
    switch (action) {
      case 'BizLicenseOCR': {
        const reg = data.RegNum || '';
        const period = data.Period
          ? String(data.Period)
          : '';
        const isLongTerm = period.includes('长期') || period.includes('永久');
        let startDate = data.FromDate ? this.formatOcrDate(String(data.FromDate)) : '';
        let endDate = data.ToDate ? this.formatOcrDate(String(data.ToDate)) : '';
        if (!startDate && period) {
          const parts = period.split('至');
          startDate = this.formatOcrDate(parts[0]?.trim() || '');
          endDate = this.formatOcrDate(parts[1]?.trim() || '');
        }
        return {
          name: data.NameOfHolder || data.Name || '',
          regNum: reg,
          person: data.LegalRepresentative || data.Person || '',
          capital: data.RegisteredCapital || data.Capital || '',
          address: data.Address || '',
          isLongTerm,
          startDate,
          endDate: isLongTerm ? '' : endDate,
        };
      }
      case 'IDCardOCR': {
        const validDate = data.ValidDate || '';
        return {
          name: data.Name || '',
          idNum: data.IdNum || data.IdCard || '',
          address: data.Address || '',
          validDate,
        };
      }
      case 'RoadTransportOCR': {
        return {
          plateNo: data.PlateNumber || '',
          owner: data.OwnerName || '',
          roadTransportCertNo: data.CertNo || '',
        };
      }
      default:
        return data;
    }
  }

  private formatOcrDate(dateStr: string): string {
    if (!dateStr) return '';
    const s = dateStr.replace(/\./g, '-').replace(/\//g, '-');
    if (/^\d{8}$/.test(s)) {
      return `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}`;
    }
    return s;
  }

  private hmacSha256(key: string | Buffer, data: string): Buffer {
    return crypto.createHmac('sha256', key).update(data).digest();
  }

  // =================== Mock 数据 ===================

  private mockBizLicense(_imageUrl: string): OcrBizLicenseResult {
    return {
      name: '杭州示例科技有限公司',
      regNum: '91330100MA2H6X0X0X',
      person: '张三',
      capital: '壹佰万圆',
      address: '浙江省杭州市西湖区文三路100号',
      isLongTerm: false,
      startDate: '2020-01-01',
      endDate: '2050-12-31',
    };
  }

  private mockIdCard(_imageUrl: string, cardSide: 'FRONT' | 'BACK'): OcrIdCardResult {
    if (cardSide === 'FRONT') {
      return {
        name: '张三',
        idNum: '330102199001011234',
        address: '浙江省杭州市西湖区文三路100号',
      };
    }
    return {
      validDate: '2020.01.01-2040.12.31',
    };
  }

  private mockRoadTransport(_imageUrl: string): OcrRoadTransportResult {
    return {
      plateNo: '浙A12345',
      owner: '杭州示例科技有限公司',
      roadTransportCertNo: '浙交运管杭字[2020]0001号',
    };
  }
}
