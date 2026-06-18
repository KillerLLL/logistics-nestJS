import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

/**
 * 进仓报价相关 DTO。
 * 字段严格对齐前端 src/api/freight.ts 的 PriceCalcParams / PriceCalcResult，
 * 以及 src/api/address.ts 的 WarehouseItem。
 */

// ============================================================
// 报价计算
// ============================================================

/** 报价计算请求参数（前端 apiCalculatePrice） */
export class PriceCalcDto {
  @ApiProperty({ description: '发站（发货地址文本，含省/市/区/街道）' })
  @IsString()
  routeStart: string;

  @ApiProperty({ description: '到站（仓库名称）' })
  @IsString()
  routeEnd: string;

  @ApiPropertyOptional({ description: '客户ID（null=标准报价），目前 mock 不影响结果' })
  @IsOptional()
  @IsString()
  gyCompanyId?: string;

  @ApiPropertyOptional({ description: '重量（吨）' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: '体积（方/m³）' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ description: 'MCP 用户ID' })
  @IsOptional()
  @IsString()
  mcpUserId?: string;
}

/**
 * 报价计算结果（前端 PriceCalcResult）。
 * 注意：税费由前端按 9% 自行计算，后端不返回税字段。
 */
export class PriceCalcResult {
  /** 重量（吨） */
  weight: number;
  /** 体积（方） */
  volume: number;
  /** 运输费 */
  transportFee: number;
  /** 装卸费 */
  loadingUnloadingFee: number;
  /** 总价（运输费 + 装卸费） */
  totalPrice: number;
  /** 费用明细文本 */
  priceDetail: string;
  /** 是否成功 */
  success: boolean;
  /** 失败原因（success=false 时） */
  message?: string;
}

// ============================================================
// 仓库列表
// ============================================================

/** 仓库列表项（前端 WarehouseItem，字段名保持下划线风格一致） */
export class WarehouseItem {
  id: string;
  warehouseName: string;
  warehouseAddress: string;
  warehouseAddressDetail: string;
  warehouseAddressCode: string;
  /** 预约电话 */
  bookingPhone: string;
  /** 投诉电话 */
  complaintPhone: string;
  /** 经度 */
  warehouseLongitude: number | string;
  /** 纬度 */
  warehouseLatitude: number | string;
  remark: string;
  createTime: string;
}

/** 分页结果（与地址簿列表保持一致的结构） */
export class PageResult<T> {
  records: T[];
  total: number;
  current: number;
  pages: number;
  size: number;
}
