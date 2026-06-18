// ============================================================
// warehouse-order.service.ts — 进仓订单服务
//
// 承载进仓订单全生命周期：
//   submit       提交下单（ningbo-warehouse 页）
//   listPage     分页列表（components/order 页）
//   statusCount  Tab 数量统计
//   detail       详情（含重新下单回填）
//   cancel       取消订单
//   remove       删除订单
//   edit         编辑（改状态）
//
// 路由前缀对齐前端 /order/gyOrder/*。
// ============================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { WarehouseOrder } from './warehouse-order.entity';
import { SubmitOrderDto, EditOrderDto } from './warehouse-order.dto';

/** 服务中状态码（供统计/取消判定） */
const STATUS = {
  WAIT_ACCEPT: '0',
  COMPLETED: '80',
  CANCELLED: '-1',
};
/** "服务中" 包含的状态（前端 Tab "服务中" 的 value） */
const SERVING_STATUS = ['10', '20', '30', '31', '40', '50', '60', '70', '71', '99'];
/** 可取消的状态 */
const CANCELLABLE_STATUS = ['0', '10', '20', '30'];

/** 状态码 → 中文名（对齐前端 ORDER_STATUS_MAP） */
const STATUS_NAME: Record<string, string> = {
  '0': '待接单',
  '10': '已指派',
  '20': '呼叫中',
  '30': '待装货',
  '31': '装货中',
  '40': '运输中',
  '50': '到达分拨中心',
  '60': '待配送',
  '70': '配送中',
  '71': '待签收',
  '80': '已完成',
  '99': '异常',
  '-1': '已取消',
};

/** 生成订单号：yyMMddHHmmss（12位）+ 2位随机 = 14位 */
function genOrderNo(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts =
    String(d.getFullYear()).slice(2) +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds());
  const rand = Math.floor(10 + Math.random() * 90);
  return `${ts}${rand}`;
}

/**
 * 从完整行政区划（如"浙江省宁波市鄞州区XX街道"）提取「区县 + 街道」部分，
 * 用于详情页路线展示（前端 splitLoadInfo/splitUnloadInfo 按 区/县/旗 二次拆分）。
 * 输入不含区县时返回原值（去掉省市级前缀后）。
 */
function extractLoadInfo(fullAddr: string | undefined): string {
  if (!fullAddr) return '';
  let s = fullAddr;
  // 去掉省级前缀
  s = s.replace(/^.{0,8}?(省|市|自治区|特别行政区)/, '');
  // 去掉市级前缀
  s = s.replace(/^.{0,8}?(市|地区|州|盟)/, '');
  return s.trim() || fullAddr;
}

let nodeSeq = 0;
/** 生成轨迹节点（对齐前端 TransportItem，精简到 mock 必需字段） */
function buildTransportNode(opts: {
  status: string;
  goodsPoint?: string;
  addr?: string;
  driverNm?: string;
  driverTelephone?: string;
}): any {
  nodeSeq += 1;
  return {
    id: `t${Date.now()}${nodeSeq}`,
    orderId: '',
    status: opts.status,
    goodsPoint: opts.goodsPoint || '',
    addr: opts.addr || '',
    createTime: fmtNow(),
    carNumber: '',
    driverId: '',
    driverNm: opts.driverNm || '',
    driverTelephone: opts.driverTelephone || '',
    latitude: 0,
    longitude: 0,
    fileList: null,
  };
}

/** 当前时间 'YYYY-MM-DD HH:mm:ss' */
function fmtNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    ' ' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes()) +
    ':' +
    pad(d.getSeconds())
  );
}

/**
 * 从完整仓库地址里剔除尾部「详细地址」部分，只保留行政区划。
 * 如 full="浙江省宁波市北仑区保税东区兴业大道 88 号"、detail="保税东区兴业大道 88 号"
 * → "浙江省宁波市北仑区"。detail 为空或非后缀时返回 full 原值。
 */
function stripDetail(full: string | undefined, detail: string | undefined): string {
  if (!full) return '';
  if (!detail) return full;
  const f = full.trim();
  const d = detail.trim();
  if (d && f.endsWith(d)) return f.slice(0, f.length - d.length).trim() || f;
  return f;
}

/**
 * 由「行政区划 + 详细地址」组装完整仓库展示地址，自动去重。
 *   district：省/市/区，不含街道门牌（如 "浙江省宁波市北仑区"）
 *   detail：街道/门牌级，不含省/市/区前缀（如 "保税东区兴业大道 88 号"）
 * 正常情况直接拼接即完整地址；为兼容脏数据（详细里混入区划前缀、或区划尾部已含详细），
 * 会先剥离重复部分，确保不会出现省/市/区/街道重复。
 */
function joinWarehouseAddr(
  district: string | undefined,
  detail: string | undefined,
): string {
  let d = (district ?? '').trim();
  let t = (detail ?? '').trim();
  if (!d && !t) return '';
  if (!d) return t;
  if (!t) return d;
  if (t.startsWith(d)) {
    // 详细已带行政区划前缀 → 剥离前缀，避免拼接后省市区重复
    t = t.slice(d.length).trim();
  } else if (d.endsWith(t)) {
    // 区划尾部已含详细 → 详细置空，直接用区划（已完整）
    t = '';
  }
  return t ? d + t : d;
}

/**
 * 规范化货物列表：扁平化为「货物项对象」数组。
 * 兼容 [[...]] 嵌套、null、undefined 等异常输入，过滤掉非对象元素。
 */
function normalizeGoodsList(raw: any): any[] {
  if (!Array.isArray(raw)) return [];
  const result: any[] = [];
  for (const item of raw) {
    if (Array.isArray(item)) {
      // 嵌套数组，递归拍平
      result.push(...normalizeGoodsList(item));
    } else if (item && typeof item === 'object') {
      result.push(item);
    }
  }
  return result;
}

@Injectable()
export class WarehouseOrderService {
  constructor(
    @InjectRepository(WarehouseOrder)
    private readonly repo: Repository<WarehouseOrder>,
  ) {}

  // ============ 提交下单 ============
  async submit(userId: string, dto: SubmitOrderDto) {
    const orderNo = genOrderNo();
    // 派生详情页路线展示用的 loadInfo/unloadInfo（区+街道）
    const loadInfo = extractLoadInfo(dto.originAddrNm);
    const unloadInfo = extractLoadInfo(
      dto.warehouseAddressDetail || dto.warehouseAddress,
    );
    // 派生卸货点字段（前端运单页/详情页按 endAddrNm + unloadAddr 展示仓库地址）。
    // 前端提交的 warehouseAddress 是「行政区划 + 详细地址」的完整拼接，
    // 需要拆成 endAddrNm=区划、unloadAddr=详细，保证详情页「区划+详细」不重复省市区街道。
    const warehouseAddress = stripDetail(
      dto.warehouseAddress,
      dto.warehouseAddressDetail,
    );
    const endAddrNm = warehouseAddress || '';
    const unloadAddr = dto.warehouseAddressDetail || '';
    // 规范化货物列表：扁平化为货物项对象数组，避免 [[...]] 嵌套
    const goodsList = normalizeGoodsList(dto.goodsList);

    // 初始轨迹节点：已下单（货主端视角）
    const transportItems = [
      buildTransportNode({
        status: '已下单',
        goodsPoint: (dto.originAddrNm || '') + (dto.loadAddr || ''),
      }),
    ];

    const entity = this.repo.create({
      ...dto,
      orderNo,
      userId,
      loadInfo,
      unloadInfo,
      endAddrNm,
      unloadAddr,
      warehouseAddress,
      goodsList,
      gyOrderTransportItems: transportItems,
      // 费用默认 0 兜底
      deliveryCost: dto.deliveryCost ?? dto.cneeCost ?? 0,
      cneeCost: dto.cneeCost ?? dto.deliveryCost ?? 0,
      loadingUnloadingCost: dto.loadingUnloadingCost ?? 0,
      taxCost: dto.taxCost ?? 0,
      totalCost: dto.totalCost ?? 0,
      goodsWeight: dto.goodsWeight ?? 0,
      goodsCube: dto.goodsCube ?? 0,
      goodsNum: dto.goodsNum ?? 0,
    });
    const saved = await this.repo.save(entity);
    return { id: saved.id, orderNo: saved.orderNo };
  }

  // ============ 分页列表 ============
  async listPage(
    userId: string,
    pageNo: number,
    pageSize: number,
    filters: {
      orderStatus?: string;
      keywords?: string;
      beginTime?: string;
      endTime?: string;
    },
  ) {
    const qb = this.repo
      .createQueryBuilder('o')
      .where('o.userId = :userId', { userId });

    // 状态：支持逗号分隔的多状态（如"服务中" Tab）
    if (filters.orderStatus) {
      const codes = filters.orderStatus
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (codes.length === 1) {
        qb.andWhere('o.orderStatus = :status', { status: codes[0] });
      } else if (codes.length > 1) {
        qb.andWhere('o.orderStatus IN (:...statuses)', { statuses: codes });
      }
    }

    if (filters.keywords) {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('o.orderNo LIKE :kw', { kw: `%${filters.keywords}%` })
            .orWhere('o.goodsName LIKE :kw', { kw: `%${filters.keywords}%` })
            .orWhere('o.warehouseName LIKE :kw', { kw: `%${filters.keywords}%` })
            .orWhere('o.cneeName LIKE :kw', { kw: `%${filters.keywords}%` });
        }),
      );
    }

    if (filters.beginTime) {
      qb.andWhere('o.createTime >= :begin', { begin: filters.beginTime });
    }
    if (filters.endTime) {
      qb.andWhere('o.createTime <= :end', { end: filters.endTime });
    }

    qb.orderBy('o.createTime', 'DESC');

    const total = await qb.getCount();
    const raw = await qb
      .skip((pageNo - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // 组装前端 OrderItem 需要的派生字段
    const records = raw.map((o) => this.toListItem(o));

    return {
      records,
      total,
      current: pageNo,
      pages: Math.ceil(total / pageSize),
      size: pageSize,
    };
  }

  // ============ 状态数量统计 ============
  async statusCount(
    userId: string,
    filters: { keywords?: string; beginTime?: string; endTime?: string },
  ) {
    const base = this.repo.createQueryBuilder('o').where('o.userId = :userId', { userId });

    if (filters.keywords) {
      base.andWhere(
        new Brackets((sub) => {
          sub
            .where('o.orderNo LIKE :kw', { kw: `%${filters.keywords}%` })
            .orWhere('o.goodsName LIKE :kw', { kw: `%${filters.keywords}%` })
            .orWhere('o.warehouseName LIKE :kw', { kw: `%${filters.keywords}%` })
            .orWhere('o.cneeName LIKE :kw', { kw: `%${filters.keywords}%` });
        }),
      );
    }
    if (filters.beginTime) base.andWhere('o.createTime >= :begin', { begin: filters.beginTime });
    if (filters.endTime) base.andWhere('o.createTime <= :end', { end: filters.endTime });

    const [total, waitAccept, serving, completed, cancelled] = await Promise.all([
      base.getCount(),
      base.clone().andWhere('o.orderStatus = :s', { s: STATUS.WAIT_ACCEPT }).getCount(),
      base.clone().andWhere('o.orderStatus IN (:...s)', { s: SERVING_STATUS }).getCount(),
      base.clone().andWhere('o.orderStatus = :s', { s: STATUS.COMPLETED }).getCount(),
      base.clone().andWhere('o.orderStatus = :s', { s: STATUS.CANCELLED }).getCount(),
    ]);

    return { total, waitAccept, serving, completed, cancelled };
  }

  // ============ 详情 ============
  async detail(id: string, userId: string) {
    const o = await this.repo.findOne({ where: { id, userId } });
    if (!o) return null;
    return this.toDetail(o);
  }

  // ============ 取消订单 ============
  async cancel(id: string, userId: string) {
    const o = await this.repo.findOne({ where: { id, userId } });
    if (!o) return false;
    if (!CANCELLABLE_STATUS.includes(o.orderStatus)) return false;
    o.orderStatus = STATUS.CANCELLED;
    this.appendNode(o, { status: '已取消' });
    await this.repo.save(o);
    return true;
  }

  // ============ 删除订单 ============
  async remove(id: string, userId: string) {
    const result = await this.repo.delete({ id, userId });
    return (result.affected ?? 0) > 0;
  }

  // ============ 编辑（改状态） ============
  async edit(id: string, userId: string, dto: EditOrderDto) {
    const o = await this.repo.findOne({ where: { id, userId } });
    if (!o) return null;
    // 状态变化时追加轨迹节点（取状态对应中文名）
    if (dto.orderStatus && dto.orderStatus !== o.orderStatus) {
      o.orderStatus = dto.orderStatus;
      const nodeName = STATUS_NAME[dto.orderStatus] || dto.orderStatus;
      this.appendNode(o, { status: nodeName });
    }
    await this.repo.save(o);
    return this.toDetail(o);
  }

  /** 向订单追加一条轨迹节点（最新节点插到数组头部，详情页时间轴倒序展示） */
  private appendNode(
    o: WarehouseOrder,
    opts: {
      status: string;
      goodsPoint?: string;
      driverNm?: string;
      driverTelephone?: string;
    },
  ) {
    const items: any[] = Array.isArray(o.gyOrderTransportItems)
      ? o.gyOrderTransportItems
      : [];
    items.unshift(buildTransportNode(opts));
    o.gyOrderTransportItems = items;
  }

  // ============ 派生字段映射 ============
  /**
   * 列表项（前端 OrderItem）。
   * 仓库地址展示优先取「endAddrNm(区划) + unloadAddr(详细)」拼接；
   * 历史订单这两个卸货字段可能为空，则用 warehouseAddress/warehouseAddressDetail 兜底，
   * 并通过 joinWarehouseAddr 自动去重，保证省/市/区/街道不会重复。
   */
  private toListItem(o: WarehouseOrder) {
    // 仓库区划：先剥离历史 warehouseAddress 尾部可能携带的详细地址，再作为兜底
    const district =
      o.endAddrNm || stripDetail(o.warehouseAddress, o.warehouseAddressDetail) || '';
    // 仓库详细：优先卸货点字段，缺省用仓库详细字段
    const detail = o.unloadAddr || o.warehouseAddressDetail || '';
    // 完整仓库地址：区划+详细去重拼接；两字段都空时回退原始 warehouseAddress
    const fullWarehouseAddr =
      joinWarehouseAddr(district, detail) || o.warehouseAddress || '';

    return {
      id: o.id,
      orderNo: o.orderNo,
      orderStatus: o.orderStatus,
      orderStatusName: STATUS_NAME[o.orderStatus] ?? '',
      createTime: this.fmtDate(o.createTime),
      goodsName: o.goodsName,
      goodsNum: o.goodsNum,
      goodsWeight: Number(o.goodsWeight),
      goodsCube: Number(o.goodsCube),
      packageType: o.packageType,
      originAddrNm: o.originAddrNm,
      loadAddr: o.loadAddr,
      loadName: '',
      loadAddress: (o.originAddrNm || '') + (o.loadAddr || ''),
      warehouseName: o.warehouseName,
      warehouseAddress: fullWarehouseAddr,
      warehouseAddressDetail: o.warehouseAddressDetail,
      cneeName: o.cneeName,
      cneePhone: o.cneePhone,
      endAddrNm: district,
      unloadAddr: detail,
      unloadAddress: fullWarehouseAddr,
      orderType: o.orderType,
      totalCost: Number(o.totalCost),
      deliveryCost: Number(o.deliveryCost),
      loadingUnloadingCost: Number(o.loadingUnloadingCost),
      taxCost: Number(o.taxCost),
      settleWay: o.settleWay,
      evaluate: o.evaluate,
      goodsList: normalizeGoodsList(o.goodsList),
      remark: o.remark,
    };
  }

  /** 详情（前端 OrderDetailRaw，字段对齐前端 mapOrderDetail 读取项） */
  private toDetail(o: WarehouseOrder) {
    // 历史数据兜底：未存 loadInfo/unloadInfo 时按地址派生
    const loadInfo =
      o.loadInfo || extractLoadInfo(o.originAddrNm || o.loadAddr);
    const unloadInfo =
      o.unloadInfo ||
      extractLoadInfo(
        o.warehouseAddressDetail || o.warehouseAddress || o.endAddrNm,
      );
    // 货物列表规范化（兼容历史 [[...]] 嵌套数据）
    const goodsList = normalizeGoodsList(o.goodsList);
    // 仓库地址拆分兜底：老数据 warehouse_address 含详细地址，剔除避免与 detail 重复
    const warehouseAddress = stripDetail(
      o.warehouseAddress,
      o.warehouseAddressDetail,
    );
    // 卸货字段兜底：历史订单 endAddrNm/unloadAddr 为空时，
    // 用 warehouseAddress(区划)/warehouseAddressDetail(详细) 回填，
    // 供详情页 endAddrNm + unloadAddr 拼接展示完整仓库地址（自动去重省市区街道）。
    const endAddrNm = o.endAddrNm || warehouseAddress || '';
    const unloadAddr = o.unloadAddr || o.warehouseAddressDetail || '';
    const fullWarehouseAddr =
      joinWarehouseAddr(endAddrNm, unloadAddr) || o.warehouseAddress || '';

    return {
      id: o.id,
      orderNo: o.orderNo,
      orderStatus: o.orderStatus,
      orderStatusName: STATUS_NAME[o.orderStatus] ?? '',
      orderType: o.orderType,
      createTime: this.fmtDate(o.createTime),
      updateTime: this.fmtDate(o.updateTime),
      goodsName: o.goodsName,
      goodsNum: o.goodsNum,
      goodsWeight: Number(o.goodsWeight),
      goodsCube: Number(o.goodsCube),
      goodsList,
      // 装货（发货）
      loadId: o.loadId,
      loadAddr: o.loadAddr,
      loadInfo,
      originAddr: o.originAddr,
      originAddrNm: o.originAddrNm,
      // 卸货（仓库）— endAddrNm(区划) + unloadAddr(详细) 去重拼接为完整地址
      unloadAddr,
      unloadInfo,
      endAddrNm,
      endLongitude: o.endLongitude,
      endLatitude: o.endLatitude,
      warehouseId: o.warehouseId,
      warehouseName: o.warehouseName,
      warehouseAddress: fullWarehouseAddr,
      warehouseAddressCode: o.warehouseAddressCode,
      warehouseAddressDetail: o.warehouseAddressDetail,
      warehouseEntryNo: o.warehouseEntryNo,
      // 时间
      useCarTime: o.useCarTime,
      expectReceiveTime: o.expectReceiveTime,
      // 增值服务
      hasLoadingUnloading: o.hasLoadingUnloading,
      loadingUnloadingCost: Number(o.loadingUnloadingCost),
      isRisk: o.isRisk,
      invoiceType: o.invoiceType,
      settleWay: o.settleWay,
      receiptRequirement: o.receiptRequirement,
      receiptNum: o.receiptNum,
      receiptStatus: o.receiptStatus,
      // 费用
      deliveryCost: Number(o.deliveryCost),
      taxCost: Number(o.taxCost),
      totalCost: Number(o.totalCost),
      warehouseEntry: Number(o.warehouseEntry) || null,
      detentionFee: Number(o.detentionFee) || null,
      palletizationFee: Number(o.palletizationFee) || null,
      otherFee: Number(o.otherFee) || null,
      otherFeeRemark: o.otherFeeRemark ?? null,
      // 联系人 / 司机
      cneeName: o.cneeName,
      cneePhone: o.cneePhone,
      driverName: o.driverName,
      driverMobile: o.driverMobile,
      trailerVehiclePlateNumber: o.trailerVehiclePlateNumber ?? '',
      // 其他
      remark: o.remark,
      evaluate: o.evaluate,
      gyOrderTransportItems: o.gyOrderTransportItems || [],
    };
  }

  /** Date → 'YYYY-MM-DD HH:mm:ss' */
  private fmtDate(d: Date): string {
    if (!d) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      ' ' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes()) +
      ':' +
      pad(d.getSeconds())
    );
  }
}
