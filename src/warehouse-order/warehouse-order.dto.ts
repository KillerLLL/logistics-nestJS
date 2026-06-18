// ============================================================
// warehouse-order.dto.ts — 进仓订单 DTO
//
// 字段严格对齐前端：
//   - SubmitOrderDto ← src/api/freight.ts 的 SubmitOrderParams
//   - EditOrderDto / IdDto ← src/api/order.ts 的 apiEditOrder / cancelOrder / deleteOrder
// ============================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsArray,
  Min,
} from 'class-validator';

/** 货物明细项（前端 goodsList 元素） */
export class GoodsItemDto {
  @IsOptional() @IsString() goodsName?: string;
  @IsOptional() @IsNumber() goodsWeight?: number;
  @IsOptional() @IsNumber() goodsCube?: number;
  @IsOptional() @IsInt() goodsNum?: number;
  @IsOptional() @IsString() packageType?: string;
  @IsOptional() @IsString() goodsPrice?: any;
}

/**
 * 提交进仓订单 DTO（对齐前端 SubmitOrderParams）。
 * 前端字段极多，仅关键字段做强校验，其余 @IsOptional 以保证兼容。
 */
export class SubmitOrderDto {
  // ── 地址 ──
  @ApiPropertyOptional({ description: '装货地址簿 id' })
  @IsOptional() @IsString() loadId?: string;

  @ApiPropertyOptional({ description: '装货地址' })
  @IsOptional() @IsString() loadAddr?: string;

  @ApiPropertyOptional({ description: '收货人' })
  @IsOptional() @IsString() cneeName?: string;

  @ApiPropertyOptional({ description: '收货人电话' })
  @IsOptional() @IsString() cneePhone?: string;

  @ApiPropertyOptional({ description: '起点' })
  @IsOptional() @IsString() originAddr?: string;

  @ApiPropertyOptional({ description: '起点名称' })
  @IsOptional() @IsString() originAddrNm?: string;

  @ApiPropertyOptional({ description: '起点经度' })
  @IsOptional() @IsString() longitude?: string;

  @ApiPropertyOptional({ description: '起点纬度' })
  @IsOptional() @IsString() latitude?: string;

  @ApiPropertyOptional({ description: '到站经度' })
  @IsOptional() @IsString() endLongitude?: string;

  @ApiPropertyOptional({ description: '到站纬度' })
  @IsOptional() @IsString() endLatitude?: string;

  // ── 仓库 ──
  @ApiPropertyOptional({ description: '仓库ID' })
  @IsOptional() @IsString() warehouseId?: string;

  @ApiPropertyOptional({ description: '仓库名称' })
  @IsString() warehouseName: string;

  @ApiPropertyOptional({ description: '仓库地址（完整行政区划）' })
  @IsOptional() @IsString() warehouseAddress?: string;

  @ApiPropertyOptional({ description: '仓库地址CODE' })
  @IsOptional() @IsString() warehouseAddressCode?: string;

  @ApiPropertyOptional({ description: '仓库详细地址' })
  @IsOptional() @IsString() warehouseAddressDetail?: string;

  @ApiPropertyOptional({ description: '进仓编号' })
  @IsOptional() @IsString() warehouseEntryNo?: string;

  // ── 货物 ──
  @ApiPropertyOptional({ description: '货物名称' })
  @IsString() goodsName: string;

  @ApiPropertyOptional({ description: '货物重量' })
  @IsOptional() @IsNumber() @Min(0) goodsWeight?: number;

  @ApiPropertyOptional({ description: '货物体积' })
  @IsOptional() @IsNumber() @Min(0) goodsCube?: number;

  @ApiPropertyOptional({ description: '货物数量' })
  @IsOptional() @IsInt() @Min(0) goodsNum?: number;

  @ApiPropertyOptional({ description: '包装方式' })
  @IsOptional() @IsString() packageType?: string;

  @ApiPropertyOptional({ description: '货物列表', type: [GoodsItemDto] })
  @IsOptional() @IsArray() goodsList?: GoodsItemDto[];

  // ── 时间 ──
  @ApiPropertyOptional({ description: '预约装货时间' })
  @IsOptional() @IsString() useCarTime?: string;

  @ApiPropertyOptional({ description: '预收货时间' })
  @IsOptional() @IsString() expectReceiveTime?: string;

  // ── 增值服务 ──
  @ApiPropertyOptional({ description: '是否装卸（0-否，1-是）' })
  @IsOptional() @IsInt() hasLoadingUnloading?: number;

  @ApiPropertyOptional({ description: '是否危险品' })
  @IsOptional() @IsString() isRisk?: string;

  @ApiPropertyOptional({ description: '发票类型（0-不开票，1-专票）' })
  @IsOptional() @IsInt() invoiceType?: number;

  @ApiPropertyOptional({ description: '结款方式（1-月结，4-到付，6-在线支付）' })
  @IsOptional() @IsString() settleWay?: string;

  @ApiPropertyOptional({ description: '回单要求' })
  @IsOptional() @IsString() receiptRequirement?: string;

  @ApiPropertyOptional({ description: '回单数' })
  @IsOptional() @IsInt() receiptNum?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional() @IsString() remark?: string;

  // ── 费用 ──
  @ApiPropertyOptional({ description: '运输费' })
  @IsOptional() @IsNumber() cneeCost?: number;

  @ApiPropertyOptional({ description: '配送费' })
  @IsOptional() @IsNumber() deliveryCost?: number;

  @ApiPropertyOptional({ description: '装卸费' })
  @IsOptional() @IsNumber() loadingUnloadingCost?: number;

  @ApiPropertyOptional({ description: '税费' })
  @IsOptional() @IsNumber() taxCost?: number;

  @ApiPropertyOptional({ description: '费用合计' })
  @IsOptional() @IsNumber() totalCost?: number;

  // ── 标记 ──
  @ApiPropertyOptional({ description: '订单来源（1-小程序）' })
  @IsOptional() @IsInt() orderSource?: number;

  @ApiPropertyOptional({ description: '发起公司id' })
  @IsOptional() @IsString() companyId?: string;

  @ApiPropertyOptional({ description: '业务类型编码' })
  @IsOptional() @IsString() businessTypeCode?: string;

  @ApiPropertyOptional({ description: '图片ID列表', type: [String] })
  @IsOptional() @IsArray() fileList?: string[];

  @ApiPropertyOptional({ description: '下单类型(3-自然单)' })
  @IsOptional() @IsString() placeType?: string;

  @ApiPropertyOptional({ description: '配送方式' })
  @IsOptional() @IsString() deliveryType?: string;

  @ApiPropertyOptional({ description: '订单类型' })
  @IsOptional() @IsString() orderType?: string;

  @ApiPropertyOptional({ description: '订单状态' })
  @IsOptional() @IsString() orderStatus?: string;

  @ApiPropertyOptional({ description: '回单状态' })
  @IsOptional() @IsString() receiptStatus?: string;

  @ApiPropertyOptional({ description: '负责平台id' })
  @IsOptional() @IsString() platformId?: string;

  @ApiPropertyOptional({ description: '承运类型' })
  @IsOptional() @IsString() carrierType?: string;

  @ApiPropertyOptional({ description: '进仓标记' })
  @IsOptional() @IsString() warehouseEntryTag?: string;
}

/** 编辑订单（仅改状态，对齐前端 apiEditOrder） */
export class EditOrderDto {
  @ApiProperty({ description: '订单 id' })
  @IsString() id: string;

  @ApiProperty({ description: '订单状态码' })
  @IsString() orderStatus: string;
}

/** 按 id 操作（取消 / 删除通用） */
export class IdDto {
  @ApiProperty({ description: '订单 id' })
  @IsString() id: string;
}
