// ============================================================
// order.module.ts — 订单模块
// 把订单相关的 Controller、Service、Entity 统一管理
// 类比前端：类似 Vue 的组合式函数把相关逻辑封装到一起
//
// 以后新增模块（如用户模块、商品模块）都按这个套路来：
//   src/user/
//     ├── user.module.ts
//     ├── user.controller.ts
//     ├── user.service.ts
//     ├── user.entity.ts
//     └── user.dto.ts
// ============================================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { FeeService } from './fee.service';
import { SmsService } from './sms.service';
import { Order } from './order.entity';

@Module({
  // 只注册 Order 实体的 Repository（数据库操作对象）
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [OrderController],
  providers: [OrderService, FeeService, SmsService],
  // exports: [OrderService],  // 如果其他模块需要用 OrderService，取消注释
})
export class OrderModule {}
