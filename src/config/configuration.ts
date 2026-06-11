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
});
