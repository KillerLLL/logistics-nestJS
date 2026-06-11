// ============================================================
// fee.service.ts — 运费计算服务
// 独立拆分出来，和 OrderService 解耦
//
// 为什么要拆？
// - 运费计算逻辑可能很复杂（按距离、重量、地区……）
// - 其他地方也可能用到运费计算（比如比价、预估）
// - 拆出来后改运费规则不用动 OrderService
// ============================================================

import { Injectable } from '@nestjs/common';

@Injectable()
export class FeeService {
  // 根据地址计算运费（这里简化模拟，实际项目会调地图 API 算距离）
  calc(address: string): number {
    if (address.includes('北京') || address.includes('上海')) return 8;
    if (address.includes('省')) return 12;
    return 15;
  }
}
