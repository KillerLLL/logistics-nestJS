// ============================================================
// user.dto.ts — 用户模块请求参数类型
//   旧 DTO（sms* / quicklogin / mpSet）：保留一版以兼容 /sys/* 老接口
//   新 DTO（updateProfile / updateCompany）：对齐前端契约 UserInfo + CompanyInfo
// ============================================================

import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  IsIn,
  MaxLength,
  Min,
} from 'class-validator';

// ===== 旧 DTO（@Deprecated：保留至下一版后下线） =====

export class SmsSendDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  mobile: string;

  @ApiProperty({ description: '短信类型', example: '1' })
  @IsString()
  smsmode: string;
}

export class SmsLoginDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  mobile: string;

  @ApiProperty({ description: '验证码', example: '123456' })
  @IsString()
  code: string;

  @ApiProperty({ description: '登录类型', example: '1' })
  @IsString()
  type: string;

  @ApiProperty({ description: '邀请码', required: false })
  @IsOptional()
  @IsString()
  invitationCode?: string;
}

export class QuickLoginDto {
  @ApiProperty({ description: '微信jsCode' })
  @IsString()
  jsCode: string;

  @ApiProperty({ description: '微信openCode（wx.login 返回的 code）' })
  @IsString()
  openCode: string;

  @ApiProperty({ description: '登录类型', example: '1' })
  @IsString()
  type: string;

  @ApiProperty({ description: '邀请码', required: false })
  @IsOptional()
  @IsString()
  invitationCode?: string;
}

export class MpSetDto {
  @ApiProperty({ description: '微信openId' })
  mpOpenid: string;
}

// ===== 新 DTO =====

/**
 * PATCH /user/profile 入参
 * 对齐前端 UserInfo 字段集（除 id/status/openId 是后端控制外，其他都可改）
 */
export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiProperty({ required: false, description: '真实姓名' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  realname?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string;

  @ApiProperty({ required: false, description: '生日 YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  birthday?: string;

  @ApiProperty({ required: false, description: '性别 1-男 2-女' })
  @IsOptional()
  @IsInt()
  @IsIn([1, 2])
  sex?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ required: false, description: '部门 code' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  orgCode?: string;

  @ApiProperty({ required: false, description: '部门名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  orgCodeTxt?: string;

  @ApiProperty({ required: false, description: '工号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  workNo?: string;

  @ApiProperty({ required: false, description: '职务' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  post?: string;

  @ApiProperty({ required: false, description: '身份 1-普通成员 2-上级' })
  @IsOptional()
  @IsInt()
  @IsIn([1, 2])
  userIdentity?: number;

  @ApiProperty({ required: false, description: '合伙人 0-否 1-是' })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  isPartner?: number;

  @ApiProperty({ required: false, description: '合伙人是否被禁用 0-否 1-是' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  partnerStatus?: string;
}

/**
 * PATCH /user/company 入参
 * 对齐前端 CompanyInfo 字段集（30 字段中除 id/审计时间是后端控制外）
 */
export class UpdateCompanyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addr?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  areaId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  areaName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  checkResult?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  companyAttribute?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  companyStatus?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  companyType?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  consignorType?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  linkman?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  linkmanMobile?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  legalRepresentative?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  licenseBeginDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  licenseEndDate?: string;

  @ApiProperty({ required: false, description: '是否长期营业执照 1-是' })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  isLicenseLongTerm?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  registeredCapital?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  permitScope?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxpayerNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoiceTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  roadCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  roadBeginDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  roadEndDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  monthlySettlement?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  industryType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  platformId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  mcpUserId?: string;
}

/**
 * POST /company/gyCompany/pqUpdate 入参
 * 对齐前端 apiPqUpdateProfile() — 平台托运人更新个人资料
 * 当前 UI 只允许改头像；后端三个字段都接受，按需扩展
 */
export class PqUpdateDto {
  @ApiProperty({ required: false, description: '头像 URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  @ApiProperty({ required: false, description: '真实姓名' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  realname?: string;

  @ApiProperty({ required: false, description: '公司名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  companyName?: string;
}
