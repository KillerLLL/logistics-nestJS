// ============================================================
// DTO (Data Transfer Object) — 数据传输对象
// 作用：定义接口的请求参数结构
// 类比前端：类似 TypeScript 中定义 interface 或 type，
//   用来约束 API 请求/响应的数据格式
//
// @ApiProperty() 是 Swagger 装饰器，让接口文档页面显示字段说明
// 装了 Swagger 后，前端同事可以直接看文档页面了解接口参数
// ============================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 创建订单的参数类型
export class CreateOrderDto {
  @ApiProperty({ description: '发件人', example: '张三' })
  sender: string;

  @ApiProperty({ description: '收件人', example: '李四' })
  receiver: string;

  @ApiProperty({ description: '收件地址', example: '北京市朝阳区' })
  address: string;
}

// 更新订单的参数类型（所有字段可选）
export class UpdateOrderDto {
  @ApiPropertyOptional({ description: '发件人' })
  sender?: string;

  @ApiPropertyOptional({ description: '收件人' })
  receiver?: string;

  @ApiPropertyOptional({ description: '收件地址' })
  address?: string;

  @ApiPropertyOptional({
    description: 'pending-待取件, picked-已取件, delivering-配送中, done-已签收',
    enum: ['pending', 'picked', 'delivering', 'done'],
  })
  status?: 'pending' | 'picked' | 'delivering' | 'done';
}
