// ============================================================
// 1718000200000-AlignUserAndWallet.ts
// 1) user 表加字段对齐前端 UserInfo（realname/birthday/sex/...）
// 2) user 表加字段对齐前端 CompanyInfo（comp_* 系列 30 字段）
// 3) wallet 表字段重命名 / 增减，对齐 ShipperWalletMyVo
//    - 删 todayIncome / pendingSettlement / frozen / points
//    - 改名为 availableAmount / withdrawingAmount / settledIncome
//      pendingIncome / totalWithdraw
// ============================================================

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignUserAndWallet1718000200000 implements MigrationInterface {
  name = 'AlignUserAndWallet1718000200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ===== user 表 =====
    await queryRunner.query(`
      ALTER TABLE \`user\`
        ADD COLUMN IF NOT EXISTS \`realname\` VARCHAR(50) NULL,
        ADD COLUMN IF NOT EXISTS \`birthday\` VARCHAR(20) NULL,
        ADD COLUMN IF NOT EXISTS \`sex\` TINYINT NULL,
        ADD COLUMN IF NOT EXISTS \`email\` VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS \`org_code\` VARCHAR(50) NULL,
        ADD COLUMN IF NOT EXISTS \`org_code_txt\` VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS \`work_no\` VARCHAR(50) NULL,
        ADD COLUMN IF NOT EXISTS \`post\` VARCHAR(50) NULL,
        ADD COLUMN IF NOT EXISTS \`user_identity\` TINYINT NULL,
        ADD COLUMN IF NOT EXISTS \`is_partner\` TINYINT NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS \`partner_status\` VARCHAR(10) NOT NULL DEFAULT '0',
        ADD COLUMN IF NOT EXISTS \`active_status\` TINYINT NOT NULL DEFAULT 1,
        ADD COLUMN IF NOT EXISTS \`company_id\` VARCHAR(32) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_name\` VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_addr\` VARCHAR(255) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_area_id\` VARCHAR(32) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_area_name\` VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_check_result\` VARCHAR(500) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_company_attribute\` VARCHAR(50) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_company_status\` INT NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS \`comp_company_type\` INT NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS \`comp_consignor_type\` INT NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS \`comp_linkman\` VARCHAR(50) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_linkman_mobile\` VARCHAR(20) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_legal_representative\` VARCHAR(50) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_license_begin_date\` VARCHAR(20) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_license_end_date\` VARCHAR(20) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_is_license_long_term\` TINYINT NULL,
        ADD COLUMN IF NOT EXISTS \`comp_registered_capital\` DECIMAL(14,2) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_permit_scope\` VARCHAR(500) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_taxpayer_number\` VARCHAR(50) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_invoice_title\` VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_road_code\` VARCHAR(50) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_road_begin_date\` VARCHAR(20) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_road_end_date\` VARCHAR(20) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_monthly_settlement\` VARCHAR(10) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_industry_type\` VARCHAR(50) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_platform_id\` VARCHAR(64) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_audit_time\` VARCHAR(20) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_update_time\` VARCHAR(20) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_create_time\` VARCHAR(20) NULL,
        ADD COLUMN IF NOT EXISTS \`comp_mcp_user_id\` VARCHAR(64) NULL;
    `);

    // ===== wallet 表：重命名/增删字段 =====
    // 先尝试删旧字段
    await queryRunner.query(`
      ALTER TABLE \`wallet\`
        DROP COLUMN IF EXISTS \`today_income\`,
        DROP COLUMN IF EXISTS \`pending_settlement\`,
        DROP COLUMN IF EXISTS \`frozen\`,
        DROP COLUMN IF EXISTS \`points\`;
    `);

    // 加新字段（若已存在则跳过）
    await queryRunner.query(`
      ALTER TABLE \`wallet\`
        ADD COLUMN IF NOT EXISTS \`available_amount\` DECIMAL(14,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS \`withdrawing_amount\` DECIMAL(14,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS \`settled_income\` DECIMAL(14,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS \`pending_income\` DECIMAL(14,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS \`total_withdraw\` DECIMAL(14,2) NOT NULL DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user\`
        DROP COLUMN IF EXISTS \`comp_mcp_user_id\`,
        DROP COLUMN IF EXISTS \`comp_create_time\`,
        DROP COLUMN IF EXISTS \`comp_update_time\`,
        DROP COLUMN IF EXISTS \`comp_audit_time\`,
        DROP COLUMN IF EXISTS \`comp_platform_id\`,
        DROP COLUMN IF EXISTS \`comp_industry_type\`,
        DROP COLUMN IF EXISTS \`comp_monthly_settlement\`,
        DROP COLUMN IF EXISTS \`comp_road_end_date\`,
        DROP COLUMN IF EXISTS \`comp_road_begin_date\`,
        DROP COLUMN IF EXISTS \`comp_road_code\`,
        DROP COLUMN IF EXISTS \`comp_invoice_title\`,
        DROP COLUMN IF EXISTS \`comp_taxpayer_number\`,
        DROP COLUMN IF EXISTS \`comp_permit_scope\`,
        DROP COLUMN IF EXISTS \`comp_registered_capital\`,
        DROP COLUMN IF EXISTS \`comp_is_license_long_term\`,
        DROP COLUMN IF EXISTS \`comp_license_end_date\`,
        DROP COLUMN IF EXISTS \`comp_license_begin_date\`,
        DROP COLUMN IF EXISTS \`comp_legal_representative\`,
        DROP COLUMN IF EXISTS \`comp_linkman_mobile\`,
        DROP COLUMN IF EXISTS \`comp_linkman\`,
        DROP COLUMN IF EXISTS \`comp_consignor_type\`,
        DROP COLUMN IF EXISTS \`comp_company_type\`,
        DROP COLUMN IF EXISTS \`comp_company_status\`,
        DROP COLUMN IF EXISTS \`comp_company_attribute\`,
        DROP COLUMN IF EXISTS \`comp_check_result\`,
        DROP COLUMN IF EXISTS \`comp_area_name\`,
        DROP COLUMN IF EXISTS \`comp_area_id\`,
        DROP COLUMN IF EXISTS \`comp_addr\`,
        DROP COLUMN IF EXISTS \`comp_name\`,
        DROP COLUMN IF EXISTS \`company_id\`,
        DROP COLUMN IF EXISTS \`active_status\`,
        DROP COLUMN IF EXISTS \`partner_status\`,
        DROP COLUMN IF EXISTS \`is_partner\`,
        DROP COLUMN IF EXISTS \`user_identity\`,
        DROP COLUMN IF EXISTS \`post\`,
        DROP COLUMN IF EXISTS \`work_no\`,
        DROP COLUMN IF EXISTS \`org_code_txt\`,
        DROP COLUMN IF EXISTS \`org_code\`,
        DROP COLUMN IF EXISTS \`email\`,
        DROP COLUMN IF EXISTS \`sex\`,
        DROP COLUMN IF EXISTS \`birthday\`,
        DROP COLUMN IF EXISTS \`realname\`;
    `);
    await queryRunner.query(`
      ALTER TABLE \`wallet\`
        DROP COLUMN IF EXISTS \`total_withdraw\`,
        DROP COLUMN IF EXISTS \`pending_income\`,
        DROP COLUMN IF EXISTS \`settled_income\`,
        DROP COLUMN IF EXISTS \`withdrawing_amount\`,
        DROP COLUMN IF EXISTS \`available_amount\`;
    `);
  }
}
