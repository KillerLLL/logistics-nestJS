// ============================================================
// certification.dto.ts — 认证模块请求参数类型
//   对齐前端 CertificationData 结构
// ============================================================

import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsIn,
  IsNumber,
  IsArray,
  MaxLength,
} from 'class-validator';

export class CertificationDto {
  @ApiProperty({ required: false, description: '记录ID' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: '发货方类型 1=企业 2=个人' })
  @IsInt()
  @IsIn([1, 2])
  consignorType: number;

  @ApiProperty({ description: '企业/个人名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '联系人' })
  @IsString()
  @MaxLength(50)
  linkman: string;

  @ApiProperty({ description: '联系电话' })
  @IsString()
  @MaxLength(20)
  linkmanMobile: string;

  @ApiProperty({ required: false, description: '纳税人识别号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxpayerNumber?: string;

  @ApiProperty({ required: false, description: '发票抬头' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoiceTitle?: string;

  @ApiProperty({ description: '证件有效期开始' })
  @IsString()
  @MaxLength(20)
  licenseBeginDate: string;

  @ApiProperty({ description: '证件有效期结束' })
  @IsString()
  @MaxLength(20)
  licenseEndDate: string;

  @ApiProperty({ description: '是否长期 0=否 1=是' })
  @IsInt()
  @IsIn([0, 1])
  isLicenseLongTerm: number;

  @ApiProperty({ description: '区域ID' })
  @IsString()
  @MaxLength(32)
  areaId: string;

  @ApiProperty({ required: false, description: '区域名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  areaName?: string;

  @ApiProperty({ description: '详细地址' })
  @IsString()
  @MaxLength(255)
  addr: string;

  // 企业字段
  @ApiProperty({ required: false, description: '法人代表' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  legalRepresentative?: string;

  @ApiProperty({ required: false, description: '注册资金（万元）' })
  @IsOptional()
  @IsNumber()
  registeredCapital?: number;

  @ApiProperty({ required: false, description: '营业执照文件ID' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  licenseFileId?: string;

  @ApiProperty({ required: false, description: '营业执照文件URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  licenseFileUrl?: string;

  // 个人字段
  @ApiProperty({ required: false, description: '身份证号' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  idCardNum?: string;

  @ApiProperty({ required: false, description: '身份证正面文件ID' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  idCardFrontFileId?: string;

  @ApiProperty({ required: false, description: '身份证正面文件URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  idCardFrontFileUrl?: string;

  @ApiProperty({ required: false, description: '身份证背面文件ID' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  idCardBackFileId?: string;

  @ApiProperty({ required: false, description: '身份证背面文件URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  idCardBackFileUrl?: string;

  // 物流字段
  @ApiProperty({ required: false, description: '道路运输证号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  roadCode?: string;

  @ApiProperty({ required: false, description: '道路运输证文件ID' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  roadFileId?: string;

  @ApiProperty({ required: false, description: '道路运输证文件URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  roadFileUrl?: string;

  @ApiProperty({ required: false, description: '道路运输证有效期' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  roadEndDate?: string;

  @ApiProperty({ required: false, description: '许可范围' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  permitScope?: string;

  // 产业类型
  @ApiProperty({ required: false, description: '产业类型' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  industryType?: string;

  @ApiProperty({ required: false, description: '企业状态 0=待审核 10=审核中 20=已通过 30=已拒绝' })
  @IsOptional()
  @IsInt()
  companyStatus?: number;

  // 区域名称（数组，用于 picker 回显）
  @ApiProperty({ required: false, description: '区域名称数组' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regionNames?: string[];
}
