// ============================================================
// 1718000100000-InitWalletTable.ts
// 初始化 wallet 表的迁移（货主/司机钱包）
// 新表用 CREATE TABLE IF NOT EXISTS；旧环境重复执行也是幂等的
// ============================================================

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitWalletTable1718000100000 implements MigrationInterface {
  name = 'InitWalletTable1718000100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`wallet\` (
        \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`user_id\` BIGINT UNSIGNED NOT NULL COMMENT '所属用户 id',
        \`owner_type\` VARCHAR(20) NOT NULL COMMENT '钱包归属 shipper/driver',
        \`balance\` DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '可用余额',
        \`today_income\` DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '今日收入',
        \`total_income\` DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '累计收入',
        \`pending_settlement\` DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '待结算金额',
        \`frozen\` DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '冻结金额',
        \`points\` INT NOT NULL DEFAULT 0 COMMENT '积分',
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_user_id\` (\`user_id\`),
        KEY \`idx_owner_type\` (\`owner_type\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钱包表';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`wallet\`;`);
  }
}
