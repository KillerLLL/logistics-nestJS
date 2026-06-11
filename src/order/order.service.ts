// ============================================================
// order.service.ts — 订单服务层
//
// 改造后：创建订单时自动计算运费、发送短信通知
// 演示：Service 之间通过「依赖注入」互相调用
//
// 拆分前：所有逻辑塞在一个文件里
// 拆分后：
//   FeeService  → 算运费（独立服务）
//   SmsService  → 发短信（独立服务）
//   OrderService → 组合调用上面的服务（编排层）
// ============================================================

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { FeeService } from './fee.service';
import { SmsService } from './sms.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    // 依赖注入：NestJS 自动创建 FeeService 和 SmsService 实例并传入
    // 类比前端：类似 React 的 useContext() 获取全局状态
    private feeService: FeeService,
    private smsService: SmsService,
  ) {}

  // 创建订单（自动计算运费 + 发短信通知）
  async create(data: { sender: string; receiver: string; address: string }) {
    // 1. 调用 FeeService 计算运费
    const fee = this.feeService.calc(data.address);

    // 2. 创建订单并存入数据库
    const order = this.orderRepo.create({ ...data, fee });
    const saved = await this.orderRepo.save(order);

    // 3. 调用 SmsService 发短信通知
    this.smsService.send(
      '13800138000',
      `您有新订单，收件人：${data.receiver}，运费：${fee}元`,
    );

    return saved;
  }

  findAll() {
    return this.orderRepo.find();
  }

  findOne(id: number) {
    return this.orderRepo.findOneBy({ id });
  }

  async update(id: number, data: Partial<Order>) {
    const order = await this.findOne(id);
    if (!order) {
      throw new HttpException('订单不存在', HttpStatus.NOT_FOUND);
    }
    Object.assign(order, data);
    return this.orderRepo.save(order);
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    if (!order) {
      throw new HttpException('订单不存在', HttpStatus.NOT_FOUND);
    }
    await this.orderRepo.delete(id);
    return { message: '删除成功' };
  }
}
