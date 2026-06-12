// ============================================================
// 1718000200000-AlignUserAndWallet.ts
// 1) user 表加字段对齐前端 UserInfo（realname/birthday/sex/...）
// 2) user 表加字段对齐前端 CompanyInfo（comp_* 系列 30 字段）
// 3) wallet 表字段重命名 / 增减，对齐 ShipperWalletMyVo
//    - 删 todayIncome / pendingSettlement / frozen / points
//    - 改名为 availableAmount / withdrawingAmount / settledIncome
//      pendingIncome / totalWithdraw
//
// 兼容 MySQL 8.0 / 5.7：用 INFORMATION_SCHEMA 动态判断后再 ALTER
// ============================================================

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignUserAndWallet1718000200000 implements MigrationInterface {
  name = 'AlignUserAndWallet1718000200000';

  private async addColumnIfMissing(
    queryRunner: QueryRunner,
    table: string,
    column: string,
    ddl: string,
  ) {
    const rows = await queryRunner.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
      [table, column],
    );
    if (Number(rows?.[0]?.cnt) === 0) {
      await queryRunner.query(`ALTER TABLE \`${table}\` ADD COLUMN ${ddl}`);
    }
  }

  private async dropColumnIfExists(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ) {
    const rows = await queryRunner.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
      [table, column],
    );
    if (Number(rows?.[0]?.cnt) > 0) {
      await queryRunner.query(`ALTER TABLE \`${table}\` DROP COLUMN \`${column}\``);
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ===== user 表 =====
    await this.addColumnIfMissing(queryRunner, 'user', 'realname', '`realname` VARCHAR(50) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'birthday', '`birthday` VARCHAR(20) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'sex', '`sex` TINYINT NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'email', '`email` VARCHAR(100) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'org_code', '`org_code` VARCHAR(50) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'org_code_txt', '`org_code_txt` VARCHAR(100) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'work_no', '`work_no` VARCHAR(50) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'post', '`post` VARCHAR(50) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'user_identity', '`user_identity` TINYINT NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'is_partner', '`is_partner` TINYINT NOT NULL DEFAULT 0');
    await this.addColumnIfMissing(queryRunner, 'user', 'partner_status', '`partner_status` VARCHAR(10) NOT NULL DEFAULT \'0\'');
    await this.addColumnIfMissing(queryRunner, 'user', 'active_status', '`active_status` TINYINT NOT NULL DEFAULT 1');
    await this.addColumnIfMissing(queryRunner, 'user', 'company_id', '`company_id` VARCHAR(32) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_name', '`comp_name` VARCHAR(100) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_addr', '`comp_addr` VARCHAR(255) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_area_id', '`comp_area_id` VARCHAR(32) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_area_name', '`comp_area_name` VARCHAR(100) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_check_result', '`comp_check_result` VARCHAR(500) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_company_attribute', '`comp_company_attribute` VARCHAR(50) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_company_status', '`comp_company_status` INT NOT NULL DEFAULT 0');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_company_type', '`comp_company_type` INT NOT NULL DEFAULT 0');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_consignor_type', '`comp_consignor_type` INT NOT NULL DEFAULT 0');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_linkman', '`comp_linkman` VARCHAR(50) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_linkman_mobile', '`comp_linkman_mobile` VARCHAR(20) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_legal_representative', '`comp_legal_representative` VARCHAR(50) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_license_begin_date', '`comp_license_begin_date` VARCHAR(20) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_license_end_date', '`comp_license_end_date` VARCHAR(20) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_is_license_long_term', '`comp_is_license_long_term` TINYINT NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_registered_capital', '`comp_registered_capital` DECIMAL(14,2) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_permit_scope', '`comp_permit_scope` VARCHAR(500) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_taxpayer_number', '`comp_taxpayer_number` VARCHAR(50) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_invoice_title', '`comp_invoice_title` VARCHAR(100) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_road_code', '`comp_road_code` VARCHAR(50) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_road_begin_date', '`comp_road_begin_date` VARCHAR(20) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_road_end_date', '`comp_road_end_date` VARCHAR(20) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_monthly_settlement', '`comp_monthly_settlement` VARCHAR(10) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_industry_type', '`comp_industry_type` VARCHAR(50) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_platform_id', '`comp_platform_id` VARCHAR(64) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_audit_time', '`comp_audit_time` VARCHAR(20) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_update_time', '`comp_update_time` VARCHAR(20) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_create_time', '`comp_create_time` VARCHAR(20) NULL');
    await this.addColumnIfMissing(queryRunner, 'user', 'comp_mcp_user_id', '`comp_mcp_user_id` VARCHAR(64) NULL');

    // ===== wallet 表：重命名/增删字段 =====
    await this.dropColumnIfExists(queryRunner, 'wallet', 'today_income');
    await this.dropColumnIfExists(queryRunner, 'wallet', 'pending_settlement');
    await this.dropColumnIfExists(queryRunner, 'wallet', 'frozen');
    await this.dropColumnIfExists(queryRunner, 'wallet', 'points');

    await this.addColumnIfMissing(queryRunner, 'wallet', 'available_amount', '`available_amount` DECIMAL(14,2) NOT NULL DEFAULT 0');
    await this.addColumnIfMissing(queryRunner, 'wallet', 'withdrawing_amount', '`withdrawing_amount` DECIMAL(14,2) NOT NULL DEFAULT 0');
    await this.addColumnIfMissing(queryRunner, 'wallet', 'settled_income', '`settled_income` DECIMAL(14,2) NOT NULL DEFAULT 0');
    await this.addColumnIfMissing(queryRunner, 'wallet', 'pending_income', '`pending_income` DECIMAL(14,2) NOT NULL DEFAULT 0');
    await this.addColumnIfMissing(queryRunner, 'wallet', 'total_withdraw', '`total_withdraw` DECIMAL(14,2) NOT NULL DEFAULT 0');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 简版回滚：把所有新加的字段都删掉（不做反向数据迁移）
    const userCols = [
      'comp_mcp_user_id', 'comp_create_time', 'comp_update_time', 'comp_audit_time',
      'comp_platform_id', 'comp_industry_type', 'comp_monthly_settlement',
      'comp_road_end_date', 'comp_road_begin_date', 'comp_road_code',
      'comp_invoice_title', 'comp_taxpayer_number', 'comp_permit_scope',
      'comp_registered_capital', 'comp_is_license_long_term', 'comp_license_end_date',
      'comp_license_begin_date', 'comp_legal_representative', 'comp_linkman_mobile',
      'comp_linkman', 'comp_consignor_type', 'comp_company_type', 'comp_company_status',
      'comp_company_attribute', 'comp_check_result', 'comp_area_name', 'comp_area_id',
      'comp_addr', 'comp_name', 'company_id', 'active_status', 'partner_status',
      'is_partner', 'user_identity', 'post', 'work_no', 'org_code_txt', 'org_code',
      'email', 'sex', 'birthday', 'realname',
    ];
    for (const c of userCols) {
      await this.dropColumnIfExists(queryRunner, 'user', c);
    }
    const walletCols = ['total_withdraw', 'pending_income', 'settled_income', 'withdrawing_amount', 'available_amount'];
    for (const c of walletCols) {
      await this.dropColumnIfExists(queryRunner, 'wallet', c);
    }
  }
}
