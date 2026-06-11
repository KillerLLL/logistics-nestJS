// ============================================================
// order.entity.ts — 订单实体（对应数据库中的 order 表）
//
// Entity 实体 = 数据库表的代码表示
// 类比前端：相当于定义了一个数据库表的「Schema」
// 这里写的每个属性 → 数据库表中的一列
//
// TypeORM 会根据这个类自动创建/更新数据库表（synchronize: true 时）
// ============================================================

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

// @Entity() 装饰器：声明这个类对应数据库中的一张表
// 表名默认取类名的小写，也可以指定：@Entity('t_order')
@Entity()
export class Order {
  // @PrimaryGeneratedColumn() → 主键，自增
  // 类比前端：类似列表中的唯一 key（:key="item.id"）
  @PrimaryGeneratedColumn()
  id: number;

  // @Column() → 普通列
  // varchar(255) 是默认类型，也可以手动指定：@Column({ type: 'text' })
  @Column({ comment: '发件人' })
  sender: string;

  @Column({ comment: '收件人' })
  receiver: string;

  @Column({ comment: '收件地址' })
  address: string;

  // @Column({ default: 'pending' }) → 设置默认值
  @Column({ default: 'pending', comment: '订单状态' })
  status: string;

  // 运费：由 FeeService 根据地址自动计算，前端不需要传
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '运费' })
  fee: number;

  // @CreateDateColumn() → 自动记录创建时间，插入数据时自动填充
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
