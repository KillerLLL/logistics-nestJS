// ============================================================
// 1718000300000-ConvertToUtf8mb4.ts
// 把数据库和所有表（含 VARCHAR/TEXT 列）统一改成 utf8mb4
//
// 背景：MySQL 早期默认是 utf8 (3 字节)，无法存 BMP 之外的字符，
// 一些中文写入会被存成 `?`（byte 0xEFBFBD）。utf8mb4 是真 4 字节 UTF-8。
//
// 修复策略：
//   1) ALTER DATABASE ... DEFAULT CHARACTER SET utf8mb4
//   2) 对每张已知表执行 ALTER TABLE ... CONVERT TO CHARACTER SET utf8mb4
//      CONVERT 会把每列也转成 utf8mb4，并按 utf8mb4_unicode_ci 重排
//   3) 防御性把所有 VARCHAR 字段显式标 CHARACTER SET utf8mb4
//      （防止表被重新创建时回退到旧的默认）
// ============================================================

import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertToUtf8mb41718000300000 implements MigrationInterface {
  name = 'ConvertToUtf8mb41718000300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ===== 1) 改数据库默认字符集 =====
    await queryRunner.query(`
      ALTER DATABASE \`${process.env.DB_NAME || 'logistics'}\`
        DEFAULT CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci;
    `);

    // ===== 2) 改每张表（含列）=====
    // 已知表：user / wallet / order（TypeORM 管理的）
    const tables = ['user', 'wallet', 'order'];
    for (const t of tables) {
      // 检查表是否存在（避免迁移到空库时失败）
      const exists = await queryRunner.query(
        `SELECT COUNT(*) AS cnt FROM information_schema.tables
         WHERE table_schema = DATABASE() AND table_name = ?`,
        [t],
      );
      if (!exists?.[0]?.cnt) continue;
      await queryRunner.query(`
        ALTER TABLE \`${t}\`
          CONVERT TO CHARACTER SET utf8mb4
          COLLATE utf8mb4_unicode_ci;
      `);
    }

    // ===== 3) 显式标每列 CHARACTER SET utf8mb4（防回退）=====
    // 仅处理会存中文的 VARCHAR 字段；其他类型不动
    const varcharColumns: Array<[string, string]> = [
      // user 表
      ['user', 'username'],
      ['user', 'realname'],
      ['user', 'avatar'],
      ['user', 'birthday'],
      ['user', 'email'],
      ['user', 'phone'],
      ['user', 'org_code'],
      ['user', 'org_code_txt'],
      ['user', 'work_no'],
      ['user', 'post'],
      ['user', 'mp_openid'],
      ['user', 'mp_unionid'],
      ['user', 'partner_status'],
      ['user', 'company_name'],
      ['user', 'nickname'],
      ['user', 'last_login_ip'],
      ['user', 'company_id'],
      ['user', 'comp_name'],
      ['user', 'comp_addr'],
      ['user', 'comp_area_id'],
      ['user', 'comp_area_name'],
      ['user', 'comp_check_result'],
      ['user', 'comp_company_attribute'],
      ['user', 'comp_linkman'],
      ['user', 'comp_linkman_mobile'],
      ['user', 'comp_legal_representative'],
      ['user', 'comp_license_begin_date'],
      ['user', 'comp_license_end_date'],
      ['user', 'comp_permit_scope'],
      ['user', 'comp_taxpayer_number'],
      ['user', 'comp_invoice_title'],
      ['user', 'comp_road_code'],
      ['user', 'comp_road_begin_date'],
      ['user', 'comp_road_end_date'],
      ['user', 'comp_monthly_settlement'],
      ['user', 'comp_industry_type'],
      ['user', 'comp_platform_id'],
      ['user', 'comp_audit_time'],
      ['user', 'comp_update_time'],
      ['user', 'comp_create_time'],
      ['user', 'comp_mcp_user_id'],
      // wallet 表（owner_type）
      ['wallet', 'owner_type'],
      // order 表
      ['order', 'sender'],
      ['order', 'receiver'],
      ['order', 'address'],
      ['order', 'status'],
    ];

    for (const [table, column] of varcharColumns) {
      const colExists = await queryRunner.query(
        `SELECT COUNT(*) AS cnt FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
        [table, column],
      );
      if (!colExists?.[0]?.cnt) continue;
      await queryRunner.query(`
        ALTER TABLE \`${table}\`
          MODIFY COLUMN \`${column}\` VARCHAR(255)
          CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚：把库/表转回 utf8（3 字节，**注意：会丢失已存的 4 字节字符**）
    const tables = ['user', 'wallet', 'order'];
    for (const t of tables) {
      const exists = await queryRunner.query(
        `SELECT COUNT(*) AS cnt FROM information_schema.tables
         WHERE table_schema = DATABASE() AND table_name = ?`,
        [t],
      );
      if (!exists?.[0]?.cnt) continue;
      await queryRunner.query(`
        ALTER TABLE \`${t}\`
          CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
      `);
    }
    await queryRunner.query(`
      ALTER DATABASE \`${process.env.DB_NAME || 'logistics'}\`
        DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
    `);
  }
}
