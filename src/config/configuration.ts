// ============================================================
// configuration.ts — 集中读取并组织环境变量
// 所有 .env 在这里被结构化，模块里通过 ConfigService.get('xxx') 拿值
// ============================================================

export interface AppConfig {
  nodeEnv: string;
  port: number;
  globalPrefix: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    charset: string;
  };
  jwt: {
    accessSecret: string;
    accessTtl: string;
    refreshSecret: string;
    refreshTtl: string;
  };
  wechat: {
    mpAppid: string;
    mpSecret: string;
    mpAesKey: string;
  };
  sms: {
    provider: string;
    rateLimitPerMin: number;
  };
  loginPolicy: {
    failLockThreshold: number;
    failLockMinutes: number;
  };
  oss: {
    /** S3 endpoint（京东云填 https://s3.cn-east-2.jdcloud-oss.com） */
    endpoint: string;
    /** S3 region（京东云填 cn-east-2） */
    region: string;
    /** bucket 名 */
    bucket: string;
    /** 公网访问域名（用于拼接返回 URL；如 https://lincode.s3.cn-east-2.jdcloud-oss.com） */
    publicHost: string;
    /** bucket 内路径前缀（ul-nestJS/） */
    pathPrefix: string;
    /** 访问密钥 */
    accessKeyId: string;
    secretAccessKey: string;
    /** 最大文件大小（字节），默认 10MB */
    maxSize: number;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  globalPrefix: process.env.GLOBAL_PREFIX || 'logistics-boot',
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'logistics',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    charset: 'utf8mb4',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change-me-access',
    accessTtl: process.env.JWT_ACCESS_TTL || '2h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh',
    refreshTtl: process.env.JWT_REFRESH_TTL || '14d',
  },
  wechat: {
    mpAppid: process.env.WX_MP_APPID || '',
    mpSecret: process.env.WX_MP_SECRET || '',
    mpAesKey: process.env.WX_MP_AES_KEY || '',
  },
  sms: {
    provider: process.env.SMS_PROVIDER || 'none',
    rateLimitPerMin: parseInt(process.env.SMS_RATE_LIMIT_PER_MIN || '5', 10),
  },
  loginPolicy: {
    failLockThreshold: parseInt(process.env.LOGIN_FAIL_LOCK_THRESHOLD || '5', 10),
    failLockMinutes: parseInt(process.env.LOGIN_FAIL_LOCK_MINUTES || '15', 10),
  },
  oss: {
    endpoint: process.env.OSS_ENDPOINT || 'https://s3.cn-east-2.jdcloud-oss.com',
    region: process.env.OSS_REGION || 'cn-east-2',
    bucket: process.env.OSS_BUCKET || 'lincode',
    publicHost:
      process.env.OSS_PUBLIC_HOST ||
      `https://${process.env.OSS_BUCKET || 'lincode'}.s3.cn-east-2.jdcloud-oss.com`,
    pathPrefix: process.env.OSS_PATH_PREFIX || 'ul-nestJS/',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.OSS_SECRET_ACCESS_KEY || '',
    maxSize: parseInt(process.env.OSS_MAX_SIZE || '10485760', 10), // 10MB
  },
});
