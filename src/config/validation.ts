// ============================================================
// validation.ts — 用 joi 校验 .env，启动时若缺关键配置则直接报错
// 避免运行到一半才发现 JWT secret 是默认值
// ============================================================

import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),
  GLOBAL_PREFIX: Joi.string().default('logistics-boot'),

  DB_HOST: Joi.string().default('127.0.0.1'),
  DB_PORT: Joi.number().default(3306),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NAME: Joi.string().default('logistics'),
  DB_SYNCHRONIZE: Joi.boolean().default(false),

  JWT_ACCESS_SECRET: Joi.string().min(8).required(),
  JWT_ACCESS_TTL: Joi.string().default('2h'),
  JWT_REFRESH_SECRET: Joi.string().min(8).required(),
  JWT_REFRESH_TTL: Joi.string().default('14d'),

  WX_MP_APPID: Joi.string().allow('').default(''),
  WX_MP_SECRET: Joi.string().allow('').default(''),
  WX_MP_AES_KEY: Joi.string().allow('').default(''),

  SMS_PROVIDER: Joi.string().default('none'),
  SMS_RATE_LIMIT_PER_MIN: Joi.number().default(5),
  LOGIN_FAIL_LOCK_THRESHOLD: Joi.number().default(5),
  LOGIN_FAIL_LOCK_MINUTES: Joi.number().default(15),
});
