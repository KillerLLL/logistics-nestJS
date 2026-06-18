// ============================================================
// warehouse-order.entity.ts — 进仓订单实体
//
// 对应前端订单模块（pages-sub/delivery/ningbo-warehouse + components/order），
// 字段覆盖前端 OrderDetailRaw / OrderItem 的全部字段。
// 表名 gy_order，与前端 /order/gyOrder/* 路由对应。
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/** 进仓订单状态码（与前端 ORDER_STATUS_MAP 对齐） */
export const ORDER_STATUS = {
  WAIT_ACCEPT: '0', // 待接单
  ASSIGNED: '10', // 已指派
  CALLING: '20', // 呼叫中
  WAIT_LOAD: '30', // 待装货
  LOADING: '31', // 装货中
  TRANSPORTING: '40', // 运输中
  ARRIVED_HUB: '50', // 到达分拨中心
  WAIT_DELIVERY: '60', // 待配送
  DELIVERING: '70', // 配送中
  WAIT_SIGN: '71', // 待签收
  COMPLETED: '80', // 已完成
  ABNORMAL: '99', // 异常
  CANCELLED: '-1', // 已取消
} as const;

@Entity('gy_order')
@Index('idx_company_id', ['companyId'])
@Index('idx_user_id', ['userId'])
@Index('idx_order_status', ['orderStatus'])
export class WarehouseOrder {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  /** 下单人（当前登录用户） */
  @Column({ name: 'user_id', type: 'bigint', unsigned: true, comment: '下单用户 id' })
  userId: string;

  /** 发起公司 id（前端 getGyCompanyId） */
  @Column({ name: 'company_id', type: 'bigint', unsigned: true, nullable: true, comment: '发起公司 id' })
  companyId: string;

  @Column({ name: 'order_no', type: 'varchar', length: 64, comment: '订单号' })
  orderNo: string;

  /** 订单状态码（见 ORDER_STATUS） */
  @Column({ name: 'order_status', type: 'varchar', length: 8, default: '0', comment: '订单状态码' })
  orderStatus: string;

  /** 订单类型（4=进仓） */
  @Column({ name: 'order_type', type: 'varchar', length: 8, default: '4', comment: '订单类型 4-进仓' })
  orderType: string;

  /** 业务类型编码 */
  @Column({ name: 'business_type_code', type: 'varchar', length: 32, nullable: true, comment: '业务类型编码' })
  businessTypeCode: string;

  // ============ 发货地址（装货地） ============
  /** 装货地址簿 id */
  @Column({ name: 'load_id', type: 'bigint', unsigned: true, nullable: true, comment: '装货地址簿 id' })
  loadId: string;

  /** 装货详细地址 */
  @Column({ name: 'load_addr', type: 'varchar', length: 255, nullable: true, comment: '装货详细地址' })
  loadAddr: string;

  /** 装货点信息（区+街道，详情页路线展示用，如"鄞州区首南街道"） */
  @Column({ name: 'load_info', type: 'varchar', length: 255, nullable: true, comment: '装货点信息（区+街道）' })
  loadInfo: string;

  /** 起点行政区划编码 */
  @Column({ name: 'origin_addr', type: 'varchar', length: 64, nullable: true, comment: '起点行政区划编码' })
  originAddr: string;

  /** 起点名称（完整行政区划） */
  @Column({ name: 'origin_addr_nm', type: 'varchar', length: 255, nullable: true, comment: '起点名称' })
  originAddrNm: string;

  /** 起点经度 */
  @Column({ type: 'varchar', length: 32, nullable: true, comment: '起点经度' })
  longitude: string;

  /** 起点纬度 */
  @Column({ type: 'varchar', length: 32, nullable: true, comment: '起点纬度' })
  latitude: string;

  // ============ 收货（仓库）信息 ============
  /** 收货人姓名 */
  @Column({ name: 'cnee_name', type: 'varchar', length: 50, nullable: true, comment: '收货人姓名' })
  cneeName: string;

  /** 收货人电话 */
  @Column({ name: 'cnee_phone', type: 'varchar', length: 20, nullable: true, comment: '收货人电话' })
  cneePhone: string;

  /** 到站经度 */
  @Column({ name: 'end_longitude', type: 'varchar', length: 32, nullable: true, comment: '到站经度' })
  endLongitude: string;

  /** 到站纬度 */
  @Column({ name: 'end_latitude', type: 'varchar', length: 32, nullable: true, comment: '到站纬度' })
  endLatitude: string;

  /** 终点名称（卸货完整行政区划） */
  @Column({ name: 'end_addr_nm', type: 'varchar', length: 255, nullable: true, comment: '终点名称' })
  endAddrNm: string;

  /** 卸货地址 */
  @Column({ name: 'unload_addr', type: 'varchar', length: 255, nullable: true, comment: '卸货地址' })
  unloadAddr: string;

  /** 卸货点信息（区+街道，详情页路线展示用） */
  @Column({ name: 'unload_info', type: 'varchar', length: 255, nullable: true, comment: '卸货点信息（区+街道）' })
  unloadInfo: string;

  /** 仓库 id */
  @Column({ name: 'warehouse_id', type: 'varchar', length: 64, nullable: true, comment: '仓库 id' })
  warehouseId: string;

  /** 仓库名称 */
  @Column({ name: 'warehouse_name', type: 'varchar', length: 100, nullable: true, comment: '仓库名称' })
  warehouseName: string;

  /** 仓库地址（完整行政区划） */
  @Column({ name: 'warehouse_address', type: 'varchar', length: 255, nullable: true, comment: '仓库地址' })
  warehouseAddress: string;

  /** 仓库地址编码 */
  @Column({ name: 'warehouse_address_code', type: 'varchar', length: 100, nullable: true, comment: '仓库地址编码' })
  warehouseAddressCode: string;

  /** 仓库详细地址 */
  @Column({ name: 'warehouse_address_detail', type: 'varchar', length: 255, nullable: true, comment: '仓库详细地址' })
  warehouseAddressDetail: string;

  /** 进仓编号 */
  @Column({ name: 'warehouse_entry_no', type: 'varchar', length: 64, nullable: true, comment: '进仓编号' })
  warehouseEntryNo: string;

  /** 进仓标记（1-进仓单） */
  @Column({ name: 'warehouse_entry_tag', type: 'varchar', length: 4, nullable: true, comment: '进仓标记 1-进仓单' })
  warehouseEntryTag: string;

  // ============ 货物信息 ============
  /** 货物名称 */
  @Column({ name: 'goods_name', type: 'varchar', length: 255, nullable: true, comment: '货物名称' })
  goodsName: string;

  /** 货物重量（kg） */
  @Column({ name: 'goods_weight', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '货物重量 kg' })
  goodsWeight: number;

  /** 货物体积（m³） */
  @Column({ name: 'goods_cube', type: 'decimal', precision: 12, scale: 4, default: 0, comment: '货物体积 m³' })
  goodsCube: number;

  /** 货物数量 */
  @Column({ name: 'goods_num', type: 'int', default: 0, comment: '货物数量' })
  goodsNum: number;

  /** 包装类型 */
  @Column({ name: 'package_type', type: 'varchar', length: 32, nullable: true, comment: '包装类型' })
  packageType: string;

  /** 货物明细列表（JSON） */
  @Column({ name: 'goods_list', type: 'json', nullable: true, comment: '货物明细列表' })
  goodsList: any;

  /** 附件文件 id 列表（JSON） */
  @Column({ name: 'file_list', type: 'json', nullable: true, comment: '附件文件 id 列表' })
  fileList: string[];

  // ============ 时间 ============
  /** 用车时间 */
  @Column({ name: 'use_car_time', type: 'varchar', length: 32, nullable: true, comment: '用车时间' })
  useCarTime: string;

  /** 预收货时间 */
  @Column({ name: 'expect_receive_time', type: 'varchar', length: 32, nullable: true, comment: '预收货时间' })
  expectReceiveTime: string;

  // ============ 增值服务 ============
  /** 是否装卸 0-否 1-是 */
  @Column({ name: 'has_loading_unloading', type: 'tinyint', default: 0, comment: '是否装卸 0-否 1-是' })
  hasLoadingUnloading: number;

  /** 是否危险品 0-否 1-是 */
  @Column({ name: 'is_risk', type: 'varchar', length: 4, default: '0', comment: '是否危险品 0-否 1-是' })
  isRisk: string;

  /** 回单要求 */
  @Column({ name: 'receipt_requirement', type: 'varchar', length: 32, default: '无', comment: '回单要求' })
  receiptRequirement: string;

  /** 回单份数 */
  @Column({ name: 'receipt_num', type: 'int', default: 0, comment: '回单份数' })
  receiptNum: number;

  /** 回单状态 0-无 */
  @Column({ name: 'receipt_status', type: 'varchar', length: 4, default: '0', comment: '回单状态' })
  receiptStatus: string;

  // ============ 财税信息 ============
  /** 发票类型 0-不开票 1-专票 */
  @Column({ name: 'invoice_type', type: 'tinyint', default: 0, comment: '发票类型 0-不开票 1-专票' })
  invoiceType: number;

  /** 结算方式 1-月结 4-到付 6-在线支付 */
  @Column({ name: 'settle_way', type: 'varchar', length: 4, default: '4', comment: '结算方式 1-月结 4-到付 6-在线支付' })
  settleWay: string;

  /** 运输费 */
  @Column({ name: 'delivery_cost', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '运输费' })
  deliveryCost: number;

  /** 配送费（兼容字段，同运输费） */
  @Column({ name: 'cnee_cost', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '配送费' })
  cneeCost: number;

  /** 装卸费 */
  @Column({ name: 'loading_unloading_cost', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '装卸费' })
  loadingUnloadingCost: number;

  /** 税费 */
  @Column({ name: 'tax_cost', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '税费' })
  taxCost: number;

  /** 进仓费 */
  @Column({ name: 'warehouse_entry', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '进仓费' })
  warehouseEntry: number;

  /** 等时费 */
  @Column({ name: 'detention_fee', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '等时费' })
  detentionFee: number;

  /** 打托费 */
  @Column({ name: 'palletization_fee', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '打托费' })
  palletizationFee: number;

  /** 其他费 */
  @Column({ name: 'other_fee', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '其他费' })
  otherFee: number;

  /** 其他费说明 */
  @Column({ name: 'other_fee_remark', type: 'varchar', length: 255, nullable: true, comment: '其他费说明' })
  otherFeeRemark: string;

  /** 总费用 */
  @Column({ name: 'total_cost', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '总费用' })
  totalCost: number;

  // ============ 评价 / 司机（mock，完成后才有值） ============
  /** 是否已评价 0-否 1-是 */
  @Column({ name: 'evaluate', type: 'tinyint', default: 0, comment: '是否已评价 0-否 1-是' })
  evaluate: number;

  /** 司机姓名 */
  @Column({ name: 'driver_name', type: 'varchar', length: 50, nullable: true, comment: '司机姓名' })
  driverName: string;

  /** 司机电话 */
  @Column({ name: 'driver_mobile', type: 'varchar', length: 20, nullable: true, comment: '司机电话' })
  driverMobile: string;

  /** 车牌号 */
  @Column({ name: 'vehicle_number', type: 'varchar', length: 20, nullable: true, comment: '车牌号' })
  vehicleNumber: string;

  /** 挂车牌号 */
  @Column({ name: 'trailer_vehicle_plate_number', type: 'varchar', length: 20, nullable: true, comment: '挂车牌号' })
  trailerVehiclePlateNumber: string;

  /** 承运商名称 */
  @Column({ name: 'logistics_name', type: 'varchar', length: 100, nullable: true, comment: '承运商名称' })
  logisticsName: string;

  // ============ 其他 ============
  /** 备注 */
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '备注' })
  remark: string;

  /** 订单来源 1-小程序 */
  @Column({ name: 'order_source', type: 'tinyint', default: 1, comment: '订单来源 1-小程序' })
  orderSource: number;

  /** 配送方式 1-专车配送 */
  @Column({ name: 'delivery_type', type: 'varchar', length: 4, default: '1', comment: '配送方式' })
  deliveryType: string;

  /** 负责平台 id */
  @Column({ name: 'platform_id', type: 'varchar', length: 16, default: '1', comment: '负责平台 id' })
  platformId: string;

  /** 下单类型 3-自然单 */
  @Column({ name: 'place_type', type: 'varchar', length: 4, default: '3', comment: '下单类型 3-自然单' })
  placeType: string;

  /** 轨迹信息（JSON，mock 空） */
  @Column({ name: 'gy_order_transport_items', type: 'json', nullable: true, comment: '轨迹信息' })
  gyOrderTransportItems: any;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
