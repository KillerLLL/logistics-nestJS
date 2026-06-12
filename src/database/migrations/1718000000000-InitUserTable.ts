// ============================================================
// 1718000000000-InitUserTable.ts
// 初始化 user 表的迁移：把现有 user 实体字段结构落库
// （旧表已存在时此迁移等同于 ALTER / 无操作；新环境则直接建表）
//
// 兼容 MySQL 8.0 / 5.7：不用 `IF NOT EXISTS` 语法（MySQL 8.0 之前不支持）
// 改用 INFORMATION_SCHEMA 动态判断后再 ALTER
// ============================================================

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUserTable1718000000000 implements MigrationInterface {
  name = 'InitUserTable1718000000000';

  private async addColumnIfMissing(
    queryRunner: QueryRunner,
    column: string,
    ddl: string,
  ) {
    const rows = await queryRunner.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'user' AND column_name = ?`,
      [column],
    );
    if (Number(rows?.[0]?.cnt) === 0) {
      await queryRunner.query(`ALTER TABLE \`user\` ADD COLUMN ${ddl}`);
    }
  }

  private async addIndexIfMissing(
    queryRunner: QueryRunner,
    indexName: string,
    ddl: string,
  ) {
    const rows = await queryRunner.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.statistics
       WHERE table_schema = DATABASE() AND table_name = 'user' AND index_name = ?`,
      [indexName],
    );
    if (Number(rows?.[0]?.cnt) === 0) {
      await queryRunner.query(`ALTER TABLE \`user\` ADD ${ddl}`);
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.addColumnIfMissing(
      queryRunner, 'username', '`username` VARCHAR(50) NULL UNIQUE',
    );
    await this.addColumnIfMissing(
      queryRunner, 'password_hash', '`password_hash` VARCHAR(100) NULL',
    );
    await this.addColumnIfMissing(
      queryRunner, 'role', "`role` VARCHAR(20) NOT NULL DEFAULT 'shipper'",
    );
    await this.addColumnIfMissing(
      queryRunner, 'mp_openid', '`mp_openid` VARCHAR(64) NULL UNIQUE',
    );
    await this.addColumnIfMissing(
      queryRunner, 'mp_unionid', '`mp_unionid` VARCHAR(64) NULL UNIQUE',
    );
    await this.addColumnIfMissing(
      queryRunner, 'refresh_token_hash', '`refresh_token_hash` VARCHAR(100) NULL',
    );
    await this.addColumnIfMissing(
      queryRunner, 'jwt_version', '`jwt_version` INT NOT NULL DEFAULT 0',
    );
    await this.addColumnIfMissing(
      queryRunner, 'last_login_at', '`last_login_at` DATETIME NULL',
    );
    await this.addColumnIfMissing(
      queryRunner, 'last_login_ip', '`last_login_ip` VARCHAR(45) NULL',
    );
    await this.addColumnIfMissing(
      queryRunner, 'status', '`status` TINYINT NOT NULL DEFAULT 1',
    );
    await this.addIndexIfMissing(queryRunner, 'idx_phone', 'INDEX `idx_phone` (`phone`)');
    await this.addIndexIfMissing(queryRunner, 'idx_mp_openid', 'INDEX `idx_mp_openid` (`mp_openid`)');
    await this.addIndexIfMissing(queryRunner, 'idx_role_status', 'INDEX `idx_role_status` (`role`, `status`)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user\`
        DROP INDEX \`idx_role_status\`,
        DROP INDEX \`idx_mp_openid\`,
        DROP INDEX \`idx_phone\`,
        DROP COLUMN \`status\`,
        DROP COLUMN \`last_login_ip\`,
        DROP COLUMN \`last_login_at\`,
        DROP COLUMN \`jwt_version\`,
        DROP COLUMN \`refresh_token_hash\`,
        DROP COLUMN \`mp_unionid\`,
        DROP COLUMN \`mp_openid\`,
        DROP COLUMN \`role\`,
        DROP COLUMN \`password_hash\`,
        DROP COLUMN \`username\`;
    `);
  }
}
