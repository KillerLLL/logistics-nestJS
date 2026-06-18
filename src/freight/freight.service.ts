// ============================================================
// freight.service.ts — 进仓报价服务
//
// 仓库列表与报价规则当前均为内置死数据：
//   - 业务上暂无维护入口，故不落库，直接用模块内常量
//   - 前端进仓快速报价（quick-quote）调用本服务
// 后续接入真实仓库/报价数据源时，替换本文件的常量与计算即可，
// Controller / DTO / 前端契约无需改动。
// ============================================================

import { Injectable } from '@nestjs/common';
import {
  PriceCalcDto,
  PriceCalcResult,
  WarehouseItem,
  PageResult,
} from './freight.dto';

/**
 * 仓库死数据（宁波主要进仓点）。
 * 字段对齐前端 WarehouseItem；经纬度为宁波市内大致坐标。
 */
const WAREHOUSES: WarehouseItem[] = [
  {
    id: 'wh10001',
    warehouseName: '宁波北仑港仓储中心',
    warehouseAddress: '浙江省宁波市北仑区',
    warehouseAddressDetail: '保税东区兴业大道 88 号',
    warehouseAddressCode: '330000,330200,330206',
    bookingPhone: '0574-88001001',
    complaintPhone: '0574-88001002',
    warehouseLongitude: 121.84342,
    warehouseLatitude: 29.88467,
    remark: '北仑港综合进仓点，支持集装箱拆装箱',
    createTime: '2025-01-01 00:00:00',
  },
  {
    id: 'wh10002',
    warehouseName: '宁波镇海大宗商品仓',
    warehouseAddress: '浙江省宁波市镇海区',
    warehouseAddressDetail: '招宝山街道定海路 168 号',
    warehouseAddressCode: '330000,330200,330211',
    bookingPhone: '0574-88002001',
    complaintPhone: '0574-88002002',
    warehouseLongitude: 121.71627,
    warehouseLatitude: 29.94857,
    remark: '大宗货物进仓，含装卸服务',
    createTime: '2025-01-01 00:00:00',
  },
  {
    id: 'wh10003',
    warehouseName: '宁波鄞州电商云仓',
    warehouseAddress: '浙江省宁波市鄞州区',
    warehouseAddressDetail: '首南街道天童南路 568 号',
    warehouseAddressCode: '330000,330200,330212',
    bookingPhone: '0574-88003001',
    complaintPhone: '0574-88003002',
    warehouseLongitude: 121.54687,
    warehouseLatitude: 29.82635,
    remark: '电商小件分拨仓',
    createTime: '2025-01-01 00:00:00',
  },
  {
    id: 'wh10004',
    warehouseName: '宁波江北冷链仓储',
    warehouseAddress: '浙江省宁波市江北区',
    warehouseAddressDetail: '洪塘街道长兴路 99 号',
    warehouseAddressCode: '330000,330200,330205',
    bookingPhone: '0574-88004001',
    complaintPhone: '0574-88004002',
    warehouseLongitude: 121.55697,
    warehouseLatitude: 29.88842,
    remark: '冷链仓储，需提前 2 小时预约',
    createTime: '2025-01-01 00:00:00',
  },
  {
    id: 'wh10005',
    warehouseName: '宁波梅山保税港区仓',
    warehouseAddress: '浙江省宁波市北仑区',
    warehouseAddressDetail: '梅山街道梅山大道 1 号',
    warehouseAddressCode: '330000,330200,330206',
    bookingPhone: '0574-88005001',
    complaintPhone: '0574-88005002',
    warehouseLongitude: 121.97856,
    warehouseLatitude: 29.79328,
    remark: '保税港区，跨境货物优先',
    createTime: '2025-01-01 00:00:00',
  },
  {
    id: 'wh10006',
    warehouseName: '宁波奉化综合物流园',
    warehouseAddress: '浙江省宁波市奉化区',
    warehouseAddressDetail: '岳林街道东环路 666 号',
    warehouseAddressCode: '330000,330200,330283',
    bookingPhone: '0574-88006001',
    complaintPhone: '0574-88006002',
    warehouseLongitude: 121.40731,
    warehouseLatitude: 29.65568,
    remark: '综合物流园区，多品类进仓',
    createTime: '2025-01-01 00:00:00',
  },
  {
    id: 'wh10007',
    warehouseName: '宁波慈溪家电产业仓',
    warehouseAddress: '浙江省宁波市慈溪市',
    warehouseAddressDetail: '白沙路街道三北大街 1188 号',
    warehouseAddressCode: '330000,330200,330282',
    bookingPhone: '0574-88007001',
    complaintPhone: '0574-88007002',
    warehouseLongitude: 121.26667,
    warehouseLatitude: 30.16973,
    remark: '家电类货物进仓',
    createTime: '2025-01-01 00:00:00',
  },
  {
    id: 'wh10008',
    warehouseName: '宁波余姚塑料城仓',
    warehouseAddress: '浙江省宁波市余姚市',
    warehouseAddressDetail: '凤山街道塑料城路 1 号',
    warehouseAddressCode: '330000,330200,330281',
    bookingPhone: '0574-88008001',
    complaintPhone: '0574-88008002',
    warehouseLongitude: 121.15446,
    warehouseLatitude: 30.03928,
    remark: '塑料原料进仓点',
    createTime: '2025-01-01 00:00:00',
  },
];

/**
 * 按仓库名称的计费规则（死数据）。
 * weightUnitPrice: 元/吨；volumeUnitPrice: 元/方；
 * loadingUnloadingFee: 固定装卸费（元/单）。
 */
interface WarehouseFeeRule {
  /** 仓库名称精确匹配 */
  warehouseName: string;
  /** 运输单价（元/吨） */
  weightUnitPrice: number;
  /** 运输单价（元/方） */
  volumeUnitPrice: number;
  /** 装卸费（元/单） */
  loadingUnloadingFee: number;
}

const FEE_RULES: WarehouseFeeRule[] = [
  { warehouseName: '宁波北仑港仓储中心', weightUnitPrice: 45, volumeUnitPrice: 80, loadingUnloadingFee: 120 },
  { warehouseName: '宁波镇海大宗商品仓', weightUnitPrice: 38, volumeUnitPrice: 65, loadingUnloadingFee: 100 },
  { warehouseName: '宁波鄞州电商云仓', weightUnitPrice: 42, volumeUnitPrice: 75, loadingUnloadingFee: 90 },
  { warehouseName: '宁波江北冷链仓储', weightUnitPrice: 55, volumeUnitPrice: 95, loadingUnloadingFee: 150 },
  { warehouseName: '宁波梅山保税港区仓', weightUnitPrice: 48, volumeUnitPrice: 85, loadingUnloadingFee: 130 },
  { warehouseName: '宁波奉化综合物流园', weightUnitPrice: 40, volumeUnitPrice: 70, loadingUnloadingFee: 95 },
  { warehouseName: '宁波慈溪家电产业仓', weightUnitPrice: 43, volumeUnitPrice: 72, loadingUnloadingFee: 88 },
  { warehouseName: '宁波余姚塑料城仓', weightUnitPrice: 39, volumeUnitPrice: 68, loadingUnloadingFee: 92 },
];

/** 兜底默认规则（仓库名未匹配到时） */
const DEFAULT_FEE_RULE: WarehouseFeeRule = {
  warehouseName: '',
  weightUnitPrice: 40,
  volumeUnitPrice: 70,
  loadingUnloadingFee: 100,
};

/** 金额四舍五入到 2 位小数 */
const round2 = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class FreightService {
  /**
   * 仓库分页列表（内存数据，支持关键字搜索）。
   */
  list(pageNo: number, pageSize: number, keywords?: string): PageResult<WarehouseItem> {
    let records = WAREHOUSES.slice();

    if (keywords) {
      const kw = keywords.trim();
      records = records.filter(
        (w) =>
          w.warehouseName.includes(kw) ||
          w.warehouseAddress.includes(kw) ||
          w.warehouseAddressDetail.includes(kw) ||
          w.bookingPhone.includes(kw),
      );
    }

    const total = records.length;
    const start = (pageNo - 1) * pageSize;
    const pageRecords = records.slice(start, start + pageSize);

    return {
      records: pageRecords,
      total,
      current: pageNo,
      pages: Math.ceil(total / pageSize),
      size: pageSize,
    };
  }

  /**
   * 根据仓库名称查仓库（供下单页等场景用）。
   */
  findByName(warehouseName: string): WarehouseItem | undefined {
    return WAREHOUSES.find((w) => w.warehouseName === warehouseName);
  }

  /**
   * 报价计算（mock）。
   * 取重量、体积中的较高计费额作为运输费；装卸费按固定金额计。
   * 若仓库匹配不到则用默认规则，但仍返回 success=true。
   */
  calculate(dto: PriceCalcDto): PriceCalcResult {
    const weight = dto.weight ?? 0;
    const volume = dto.volume ?? 0;

    // 未提供任何货物量，无法报价
    if (weight <= 0 && volume <= 0) {
      return {
        weight,
        volume,
        transportFee: 0,
        loadingUnloadingFee: 0,
        totalPrice: 0,
        priceDetail: '',
        success: false,
        message: '请输入重量或体积',
      };
    }

    const rule =
      FEE_RULES.find((r) => r.warehouseName === dto.routeEnd) ?? DEFAULT_FEE_RULE;

    const feeByWeight = weight * rule.weightUnitPrice;
    const feeByVolume = volume * rule.volumeUnitPrice;
    // 取大值（整车/计费重量取大原则）
    const transportFee = round2(Math.max(feeByWeight, feeByVolume));
    const loadingUnloadingFee = round2(rule.loadingUnloadingFee);
    const totalPrice = round2(transportFee + loadingUnloadingFee);

    const priceDetail = `运输费${transportFee}元（${rule.weightUnitPrice}元/吨，${rule.volumeUnitPrice}元/方，取大值）+ 装卸费${loadingUnloadingFee}元 = ${totalPrice}元`;

    return {
      weight,
      volume,
      transportFee,
      loadingUnloadingFee,
      totalPrice,
      priceDetail,
      success: true,
    };
  }
}
