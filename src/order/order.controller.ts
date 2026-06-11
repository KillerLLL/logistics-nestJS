// ============================================================
// order.controller.ts — 订单控制器
// 定义订单相关的 API 接口
//
// 前端调接口的方式（以 axios 为例）：
//   GET  /orders          → axios.get('/orders')
//   GET  /orders/1        → axios.get('/orders/1')
//   POST /orders          → axios.post('/orders', body)         创建
//   POST /orders/update/1 → axios.post('/orders/update/1', body) 更新
//   POST /orders/delete/1 → axios.post('/orders/delete/1')     删除
// ============================================================

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto } from './order.dto';

@ApiTags('订单管理')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // POST /orders — 创建订单
  @ApiOperation({ summary: '创建订单' })
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  // GET /orders — 获取所有订单
  @ApiOperation({ summary: '获取所有订单' })
  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  // GET /orders/:id — 获取单个订单
  @ApiOperation({ summary: '获取单个订单' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    const order = this.orderService.findOne(id);
    if (!order) {
      throw new HttpException('订单不存在', HttpStatus.NOT_FOUND);
    }
    return order;
  }

  // POST /orders/update/:id — 更新订单
  @ApiOperation({ summary: '更新订单' })
  @Post('update/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, dto);
  }

  // POST /orders/delete/:id — 删除订单
  @ApiOperation({ summary: '删除订单' })
  @Post('delete/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.remove(id);
  }
}
