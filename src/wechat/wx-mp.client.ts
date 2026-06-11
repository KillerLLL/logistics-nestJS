// ============================================================
// wx-mp.client.ts — 微信小程序 API 客户端
//   - jscode2session: 拿 jsCode 换 openid / session_key / unionid
//   - 错误码映射：errcode != 0 时映射为内部错误
//
// 沙箱 mock 行为：
//   - 当 WX_MP_APPID / WX_MP_SECRET 未配置（即 AppSecret 仍是占位符）时，
//     自动启用 mock 替身，方便联调未到位时的开发自测
//   - mock 仅在「无真实密钥」时生效，不引入生产可触发的开关
// ============================================================

import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface JsCode2SessionResult {
  openid: string;
  unionid?: string;
  sessionKey: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class WxMpClient {
  private readonly logger = new Logger(WxMpClient.name);
  private readonly http: AxiosInstance;
  private readonly appid: string;
  private readonly secret: string;
  private readonly mockMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.http = axios.create({ timeout: 5000 });
    this.appid = config.get<string>('wechat.mpAppid') || '';
    this.secret = config.get<string>('wechat.mpSecret') || '';
    // 仅当 AppSecret 是占位符或为空时启用 mock；不会出现在生产路径
    this.mockMode = !this.secret || this.secret.startsWith('__');
    if (this.mockMode) {
      this.logger.warn(
        '[WxMpClient] WX_MP_SECRET 未配置（占位符），启用沙箱 mock 替身 — 接入真实 AppSecret 后需联调验证',
      );
    }
  }

  isMock(): boolean {
    return this.mockMode;
  }

  // ---------- 拿 code 换 openid ----------
  async exchangeJsCode(jsCode: string): Promise<JsCode2SessionResult> {
    if (this.mockMode) {
      return this.mockExchangeJsCode(jsCode);
    }
    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    try {
      const { data } = await this.http.get(url, {
        params: {
          appid: this.appid,
          secret: this.secret,
          js_code: jsCode,
          grant_type: 'authorization_code',
        },
      });
      if (data.errcode && data.errcode !== 0) {
        // 错误码映射：业务侧不暴露微信原始 errmsg
        this.logger.warn(`[WxMpClient] jscode2session errcode=${data.errcode} errmsg=${data.errmsg}`);
        throw new ServiceUnavailableException('微信服务暂时不可用');
      }
      return {
        openid: data.openid,
        unionid: data.unionid,
        sessionKey: data.session_key,
      };
    } catch (e) {
      if (e instanceof ServiceUnavailableException) throw e;
      this.logger.error('[WxMpClient] jscode2session HTTP error', (e as Error).stack);
      throw new ServiceUnavailableException('微信服务暂时不可用');
    }
  }

  // ---------- 解密手机号（getPhoneNumber 返回的加密数据） ----------
  // 真实环境需要 WX_MP_AES_KEY 或通过 code2session 拿 session_key
  // 当前实现用 sessionKey 解密
  decryptPhoneNumber(sessionKey: string, encryptedData: string, iv: string): string {
    if (this.mockMode) {
      return this.mockDecryptPhoneNumber(encryptedData);
    }
    try {
      const decipher = crypto.createDecipheriv(
        'aes-128-cbc',
        Buffer.from(sessionKey, 'base64'),
        Buffer.from(iv, 'base64'),
      );
      let decoded = decipher.update(encryptedData, 'base64', 'utf8');
      decoded += decipher.final('utf8');
      const obj = JSON.parse(decoded);
      return obj.phoneNumber || '';
    } catch (e) {
      this.logger.error('[WxMpClient] decryptPhoneNumber failed', (e as Error).stack);
      throw new ServiceUnavailableException('手机号解密失败');
    }
  }

  // ---------- 沙箱 mock：openid 流程 ----------
  private mockExchangeJsCode(jsCode: string): JsCode2SessionResult {
    // 用 jsCode 哈希生成稳定的 mock openid（保证同一 code 多次调用拿到同一 openid）
    const openid = 'mock_openid_' + crypto.createHash('md5').update(jsCode).digest('hex').slice(0, 24);
    const sessionKey = 'mock_sess_' + crypto.randomBytes(12).toString('hex');
    return { openid, sessionKey };
  }

  // ---------- 沙箱 mock：手机号解密 ----------
  private mockDecryptPhoneNumber(encryptedData: string): string {
    // mock 模式下：客户端传"13800138000"即可；任何非 11 位视为 13800138000
    const e = decodeURIComponent(encryptedData || '').trim();
    if (/^1\d{10}$/.test(e)) return e;
    return '13800138000';
  }
}
