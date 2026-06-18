// ============================================================
// warehouse-order.controller.ts — 进仓订单接口
//
// 路由前缀 order/gyOrder，对齐前端 src/api/order.ts + freight.ts：
//   GET  /order/gyOrder/ShipperPage               分页列表
//   GET  /order/gyOrder/ShipperOrderStatusCount   状态数量统计
//   GET  /order/gyOrder/ShipperOrderDetails       详情
//   POST /order/gyOrder/add                        提交下单
//   POST /order/gyOrder/edit                       编辑（改状态）
//   POST /order/gyOrder/cancelOrder                取消
//   POST /order/gyOrder/deleteOrder                删除
// （全局前缀 logistics-boot 由 main.ts 注入）
// ============================================================

import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WarehouseOrderService } from './warehouse-order.service';
import { SubmitOrderDto, EditOrderDto, IdDto } from './warehouse-order.dto';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Result } from '../common/result';

@ApiTags('进仓订单')
@ApiBearerAuth('access-token')
@Controller('order/gyOrder')
export class WarehouseOrderController {
  constructor(private readonly orderService: WarehouseOrderService) {}

  // ============ 提交下单（ningbo-warehouse 页） ============
  @ApiOperation({ summary: '提交进仓订单' })
  @Post('add')
  async add(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitOrderDto,
  ) {
    const data = await this.orderService.submit(user.sub, dto);
    return Result.ok(data, '下单成功');
  }

  // ============ 分页列表（components/order 页） ============
  @ApiOperation({ summary: '订单列表（分页）' })
  @Get('ShipperPage')
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('pageNo') pageNo = 1,
    @Query('pageSize') pageSize = 10,
    @Query('orderStatus') orderStatus?: string,
    @Query('keywords') keywords?: string,
    @Query('beginTime') beginTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const data = await this.orderService.listPage(user.sub, +pageNo, +pageSize, {
      orderStatus,
      keywords,
      beginTime,
      endTime,
    });
    return Result.ok(data, '查询成功');
  }

  // ============ 状态数量统计 ============
  @ApiOperation({ summary: '订单状态数量统计' })
  @Get('ShipperOrderStatusCount')
  async statusCount(
    @CurrentUser() user: JwtPayload,
    @Query('keywords') keywords?: string,
    @Query('beginTime') beginTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const data = await this.orderService.statusCount(user.sub, {
      keywords,
      beginTime,
      endTime,
    });
    return Result.ok(data, '查询成功');
  }

  // ============ 订单详情 ============
  @ApiOperation({ summary: '订单详情' })
  @Get('ShipperOrderDetails')
  async detail(
    @CurrentUser() user: JwtPayload,
    @Query('id') id: string,
  ) {
    const data = await this.orderService.detail(id, user.sub);
    if (!data) return Result.fail('订单不存在', 404);
    return Result.ok(data, '查询成功');
  }

  // ============ 编辑（改状态） ============
  @ApiOperation({ summary: '编辑订单（改状态）' })
  @Post('edit')
  async edit(
    @CurrentUser() user: JwtPayload,
    @Body() dto: EditOrderDto,
  ) {
    const data = await this.orderService.edit(dto.id, user.sub, dto);
    if (!data) return Result.fail('订单不存在', 404);
    return Result.ok(data, '编辑成功');
  }

  // ============ 取消订单 ============
  @ApiOperation({ summary: '取消订单' })
  @Post('cancelOrder')
  async cancel(
    @CurrentUser() user: JwtPayload,
    @Body() dto: IdDto,
  ) {
    const ok = await this.orderService.cancel(dto.id, user.sub);
    if (!ok) return Result.fail('取消失败，订单不存在或当前状态不可取消', 400);
    return Result.ok(null, '取消成功');
  }

  // ============ 删除订单 ============
  @ApiOperation({ summary: '删除订单' })
  @Post('deleteOrder')
  async remove(
    @CurrentUser() user: JwtPayload,
    @Body() dto: IdDto,
  ) {
    const ok = await this.orderService.remove(dto.id, user.sub);
    if (!ok) return Result.fail('删除失败', 400);
    return Result.ok(null, '删除成功');
  }
}
