// ============================================================
// user.entity.ts — 用户表实体
// 对应数据库中的 user 表，TypeORM 自动创建/迁移
// 字段定义对齐架构师方案 §4.1
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

@Entity('user')
@Index('uk_username', ['username'], { unique: true })
@Index('uk_phone', ['phone'], { unique: true })
@Index('uk_mp_openid', ['mpOpenid'], { unique: true })
@Index('uk_mp_unionid', ['mpUnionid'], { unique: true })
@Index('idx_role_status', ['role', 'status'])
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  // 登录账号（对齐前端契约：账号+密码）
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '登录账号' })
  username: string;

  // bcrypt 哈希后的密码
  @Column({ name: 'password_hash', type: 'varchar', length: 100, nullable: true, comment: '密码哈希' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '手机号' })
  phone: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '昵称' })
  nickname: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '头像' })
  avatar: string;

  // shipper / driver / admin
  @Column({ type: 'varchar', length: 20, default: 'shipper', comment: '角色' })
  role: UserRole;

  // 0 未认证 / 1 已认证
  @Column({ name: 'cert_status', type: 'varchar', length: 2, default: '0', comment: '认证状态' })
  certStatus: string;

  @Column({ name: 'company_name', type: 'varchar', length: 100, nullable: true, comment: '公司名称' })
  companyName: string;

  // 微信小程序 openid
  @Column({ name: 'mp_openid', type: 'varchar', length: 64, nullable: true, comment: '微信 openid' })
  mpOpenid: string;

  // 开放平台 unionid（可选）
  @Column({ name: 'mp_unionid', type: 'varchar', length: 64, nullable: true, comment: '微信 unionid' })
  mpUnionid: string;

  // refresh token 的 SHA256（吊销用）
  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 100, nullable: true, comment: 'refresh token 哈希' })
  refreshTokenHash: string;

  // 主动踢出：升版本使旧 access 失效
  @Column({ name: 'jwt_version', type: 'int', default: 0, comment: 'JWT 版本号' })
  jwtVersion: number;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true, comment: '最近登录时间' })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', type: 'varchar', length: 45, nullable: true, comment: '最近登录 IP' })
  lastLoginIp: string;

  // 1 启用 / 0 封禁
  @Column({ type: 'tinyint', default: 1, comment: '状态 1启用 0封禁' })
  status: number;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}
