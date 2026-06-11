// ============================================================
// user.entity.ts — 用户表实体
// 字段对齐前端 `tuniao-ui-vue3-uniapp-template-master/src/api/user.ts`
// 的 `UserInfo` + `CompanyInfo` 两块结构（后端 user 表合并保存）
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type UserRole = 'shipper' | 'driver' | 'admin';
export type UserStatus = 1 | 2; // 1-正常 2-冻结
export type Sex = 1 | 2 | null; // 1-男 2-女
export type UserIdentity = 1 | 2 | null; // 1-普通成员 2-上级

@Entity('user')
@Index('uk_username', ['username'], { unique: true })
@Index('uk_phone', ['phone'], { unique: true })
@Index('uk_mp_openid', ['mpOpenid'], { unique: true })
@Index('uk_mp_unionid', ['mpUnionid'], { unique: true })
@Index('idx_role_status', ['role', 'status'])
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  // ===== UserInfo =====
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '登录账号' })
  username: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '真实姓名' })
  realname: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '头像' })
  avatar: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '生日 YYYY-MM-DD' })
  birthday: string;

  @Column({ type: 'tinyint', nullable: true, comment: '性别 1-男 2-女' })
  sex: Sex;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '电子邮件' })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '手机号' })
  phone: string;

  @Column({ name: 'org_code', type: 'varchar', length: 50, nullable: true, comment: '部门code' })
  orgCode: string;

  @Column({ name: 'org_code_txt', type: 'varchar', length: 100, nullable: true, comment: '部门名称' })
  orgCodeTxt: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态 1-正常 2-冻结' })
  status: UserStatus;

  @Column({ name: 'work_no', type: 'varchar', length: 50, nullable: true, comment: '工号' })
  workNo: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '职务' })
  post: string;

  @Column({ name: 'user_identity', type: 'tinyint', nullable: true, comment: '身份 1-普通成员 2-上级' })
  userIdentity: UserIdentity;

  @Column({ name: 'mp_openid', type: 'varchar', length: 64, nullable: true, comment: '微信 openid' })
  mpOpenid: string;

  @Column({ name: 'mp_unionid', type: 'varchar', length: 64, nullable: true, comment: '微信 unionid' })
  mpUnionid: string;

  @Column({ name: 'is_partner', type: 'tinyint', default: 0, comment: '合伙人标识 0-否 1-是' })
  isPartner: number;

  @Column({ name: 'partner_status', type: 'varchar', length: 10, default: '0', comment: '合伙人是否被禁用 0-否 1-是' })
  partnerStatus: string;

  // ===== 业务字段 =====
  @Column({ type: 'varchar', length: 20, default: 'shipper', comment: '角色 shipper/driver/admin' })
  role: UserRole;

  @Column({ name: 'cert_status', type: 'varchar', length: 2, default: '0', comment: '认证状态 0未认证 1已认证' })
  certStatus: string;

  @Column({ name: 'company_name', type: 'varchar', length: 100, nullable: true, comment: '公司名称（冗余，便于列表展示）' })
  companyName: string;

  // 兼容：原 nickname 字段保留
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '昵称' })
  nickname: string;

  // ===== 鉴权 =====
  @Column({ name: 'password_hash', type: 'varchar', length: 100, nullable: true, comment: '密码哈希' })
  passwordHash: string;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 100, nullable: true, comment: 'refresh token 哈希' })
  refreshTokenHash: string | null;

  @Column({ name: 'jwt_version', type: 'int', default: 0, comment: 'JWT 版本号' })
  jwtVersion: number;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true, comment: '最近登录时间' })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', type: 'varchar', length: 45, nullable: true, comment: '最近登录 IP' })
  lastLoginIp: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态 1启用 0封禁（与 user.status 不同字段，避免冲突）' })
  activeStatus: number;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  // ===== CompanyInfo（30 字段，前端要求每条记录都有）=====
  // 实际企业数据后期会拆到独立 gy_company 表；当前用 user 上平铺字段
  // 保留占位以便 getUserInfo 直接取
  @Column({ name: 'company_id', type: 'varchar', length: 32, nullable: true, comment: '企业 id' })
  companyId: string;

  @Column({ name: 'comp_name', type: 'varchar', length: 100, nullable: true, comment: '公司名称（CompanyInfo.name）' })
  compName: string;

  @Column({ name: 'comp_addr', type: 'varchar', length: 255, nullable: true, comment: '地址' })
  compAddr: string;

  @Column({ name: 'comp_area_id', type: 'varchar', length: 32, nullable: true, comment: '区域ID' })
  compAreaId: string;

  @Column({ name: 'comp_area_name', type: 'varchar', length: 100, nullable: true, comment: '区域名称' })
  compAreaName: string;

  @Column({ name: 'comp_check_result', type: 'varchar', length: 500, nullable: true, comment: '审核拒绝原因' })
  compCheckResult: string;

  @Column({ name: 'comp_company_attribute', type: 'varchar', length: 50, nullable: true, comment: '企业属性' })
  compCompanyAttribute: string;

  @Column({ name: 'comp_company_status', type: 'int', default: 0, comment: '企业状态' })
  compCompanyStatus: number;

  @Column({ name: 'comp_company_type', type: 'int', default: 0, comment: '企业类型' })
  compCompanyType: number;

  @Column({ name: 'comp_consignor_type', type: 'int', default: 0, comment: '发货方类型' })
  compConsignorType: number;

  @Column({ name: 'comp_linkman', type: 'varchar', length: 50, nullable: true, comment: '联系人' })
  compLinkman: string;

  @Column({ name: 'comp_linkman_mobile', type: 'varchar', length: 20, nullable: true, comment: '联系电话' })
  compLinkmanMobile: string;

  @Column({ name: 'comp_legal_representative', type: 'varchar', length: 50, nullable: true, comment: '法人代表' })
  compLegalRepresentative: string;

  @Column({ name: 'comp_license_begin_date', type: 'varchar', length: 20, nullable: true, comment: '营业执照开始日期' })
  compLicenseBeginDate: string;

  @Column({ name: 'comp_license_end_date', type: 'varchar', length: 20, nullable: true, comment: '营业执照结束日期' })
  compLicenseEndDate: string;

  @Column({ name: 'comp_is_license_long_term', type: 'tinyint', nullable: true, comment: '是否长期营业执照 1-是' })
  compIsLicenseLongTerm: number;

  @Column({ name: 'comp_registered_capital', type: 'decimal', precision: 14, scale: 2, nullable: true, comment: '注册资本' })
  compRegisteredCapital: number;

  @Column({ name: 'comp_permit_scope', type: 'varchar', length: 500, nullable: true, comment: '许可范围' })
  compPermitScope: string;

  @Column({ name: 'comp_taxpayer_number', type: 'varchar', length: 50, nullable: true, comment: '纳税人识别号' })
  compTaxpayerNumber: string;

  @Column({ name: 'comp_invoice_title', type: 'varchar', length: 100, nullable: true, comment: '发票抬头' })
  compInvoiceTitle: string;

  @Column({ name: 'comp_road_code', type: 'varchar', length: 50, nullable: true, comment: '道路运输证号' })
  compRoadCode: string;

  @Column({ name: 'comp_road_begin_date', type: 'varchar', length: 20, nullable: true, comment: '道路运输证开始日期' })
  compRoadBeginDate: string;

  @Column({ name: 'comp_road_end_date', type: 'varchar', length: 20, nullable: true, comment: '道路运输证结束日期' })
  compRoadEndDate: string;

  @Column({ name: 'comp_monthly_settlement', type: 'varchar', length: 10, nullable: true, comment: '月结 0-否' })
  compMonthlySettlement: string;

  @Column({ name: 'comp_industry_type', type: 'varchar', length: 50, nullable: true, comment: '行业类型' })
  compIndustryType: string;

  @Column({ name: 'comp_platform_id', type: 'varchar', length: 64, nullable: true, comment: '平台ID' })
  compPlatformId: string;

  @Column({ name: 'comp_audit_time', type: 'varchar', length: 20, nullable: true, comment: '审核时间' })
  compAuditTime: string;

  @Column({ name: 'comp_update_time', type: 'varchar', length: 20, nullable: true, comment: '更新时间' })
  compUpdateTime: string;

  @Column({ name: 'comp_create_time', type: 'varchar', length: 20, nullable: true, comment: '创建时间' })
  compCreateTime: string;

  @Column({ name: 'comp_mcp_user_id', type: 'varchar', length: 64, nullable: true, comment: 'MCP 用户ID' })
  compMcpUserId: string;
}
