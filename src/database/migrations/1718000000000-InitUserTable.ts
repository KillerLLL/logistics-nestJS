// ============================================================
// 1718000000000-InitUserTable.ts
// 初始化 user 表的迁移：把现有 user 实体字段结构落库
// （旧表已存在时此迁移等同于 ALTER / 无操作；新环境则直接建表）
// ============================================================

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUserTable1718000000000 implements MigrationInterface {
  name = 'InitUserTable1718000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 增量添加新字段（兼容已有 user 表）
    await queryRunner.query(`
      ALTER TABLE \`user\`
        ADD COLUMN IF NOT EXISTS \`username\` VARCHAR(50) NULL UNIQUE,
        ADD COLUMN IF NOT EXISTS \`password_hash\` VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS \`role\` VARCHAR(20) NOT NULL DEFAULT 'shipper',
        ADD COLUMN IF NOT EXISTS \`mp_openid\` VARCHAR(64) NULL UNIQUE,
        ADD COLUMN IF NOT EXISTS \`mp_unionid\` VARCHAR(64) NULL UNIQUE,
        ADD COLUMN IF NOT EXISTS \`refresh_token_hash\` VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS \`jwt_version\` INT NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS \`last_login_at\` DATETIME NULL,
        ADD COLUMN IF NOT EXISTS \`last_login_ip\` VARCHAR(45) NULL,
        ADD COLUMN IF NOT EXISTS \`status\` TINYINT NOT NULL DEFAULT 1,
        ADD INDEX IF NOT EXISTS \`idx_phone\` (\`phone\`),
        ADD INDEX IF NOT EXISTS \`idx_mp_openid\` (\`mp_openid\`),
        ADD INDEX IF NOT EXISTS \`idx_role_status\` (\`role\`, \`status\`);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user\`
        DROP INDEX IF EXISTS \`idx_role_status\`,
        DROP INDEX IF EXISTS \`idx_mp_openid\`,
        DROP INDEX IF EXISTS \`idx_phone\`,
        DROP COLUMN IF EXISTS \`status\`,
        DROP COLUMN IF EXISTS \`last_login_ip\`,
        DROP COLUMN IF EXISTS \`last_login_at\`,
        DROP COLUMN IF EXISTS \`jwt_version\`,
        DROP COLUMN IF EXISTS \`refresh_token_hash\`,
        DROP COLUMN IF EXISTS \`mp_unionid\`,
        DROP COLUMN IF EXISTS \`mp_openid\`,
        DROP COLUMN IF EXISTS \`role\`,
        DROP COLUMN IF EXISTS \`password_hash\`,
        DROP COLUMN IF EXISTS \`username\`;
    `);
  }
}
