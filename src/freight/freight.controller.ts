// ============================================================
// freight.controller.ts — 进仓报价接口
//
// 路由对齐前端 src/api：
//   GET  /freight/warehouse/list            仓库分页列表（apiGetWarehouseList）
//   POST /freight/routePrice/calculate      报价计算（apiCalculatePrice）
// （全局前缀 logistics-boot 已由 .env 的 GLOBAL_PREFIX 注入）
// ============================================================

import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FreightService } from './freight.service';
import { PriceCalcDto } from './freight.dto';
import { Result } from '../common/result';

@ApiTags('进仓报价')
@ApiBearerAuth('access-token')
@Controller('freight')
export class FreightController {
  constructor(private readonly freightService: FreightService) {}

  @ApiOperation({ summary: '仓库列表（分页）' })
  @Get('warehouse/list')
  async warehouseList(
    @Query('pageNo') pageNo = 1,
    @Query('pageSize') pageSize = 8,
    @Query('keywords') keywords?: string,
  ) {
    const data = this.freightService.list(+pageNo, +pageSize, keywords);
    return Result.ok(data, '查询成功');
  }

  @ApiOperation({ summary: '进仓报价计算' })
  @Post('routePrice/calculate')
  async calculate(@Body() dto: PriceCalcDto) {
    const data = this.freightService.calculate(dto);
    return Result.ok(data, '计算成功');
  }
}
