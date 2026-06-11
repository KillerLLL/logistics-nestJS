// ============================================================
// wallet.entity.ts — 钱包表实体
// 字段名严格对齐前端 `tuniao-ui-vue3-uniapp-template-master/src/api/wallet.ts`
// `ShipperWalletMyVo` 字符级一致：
//   balance / availableAmount / withdrawingAmount / totalIncome
//   settledIncome / pendingIncome / totalWithdraw
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type WalletOwnerType = 'shipper' | 'driver';

@Entity('wallet')
@Index('uk_user_id', ['userId'], { unique: true })
@Index('idx_owner_type', ['ownerType'])
export class Wallet {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  // 所属用户 id
  @Column({ name: 'user_id', type: 'bigint', unsigned: true, comment: '所属用户 id' })
  userId: string;

  // 货主 / 司机
  @Column({ name: 'owner_type', type: 'varchar', length: 20, comment: '钱包归属 shipper/driver' })
  ownerType: WalletOwnerType;

  /** 钱包余额 */
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0, comment: '钱包余额' })
  balance: string;

  /** 可提现金额 */
  @Column({ name: 'available_amount', type: 'decimal', precision: 14, scale: 2, default: 0, comment: '可提现金额' })
  availableAmount: string;

  /** 提现中金额 */
  @Column({ name: 'withdrawing_amount', type: 'decimal', precision: 14, scale: 2, default: 0, comment: '提现中金额' })
  withdrawingAmount: string;

  /** 累计收益 */
  @Column({ name: 'total_income', type: 'decimal', precision: 14, scale: 2, default: 0, comment: '累计收益' })
  totalIncome: string;

  /** 已结算收益 */
  @Column({ name: 'settled_income', type: 'decimal', precision: 14, scale: 2, default: 0, comment: '已结算收益' })
  settledIncome: string;

  /** 待结算收益 */
  @Column({ name: 'pending_income', type: 'decimal', precision: 14, scale: 2, default: 0, comment: '待结算收益' })
  pendingIncome: string;

  /** 累计提现 */
  @Column({ name: 'total_withdraw', type: 'decimal', precision: 14, scale: 2, default: 0, comment: '累计提现' })
  totalWithdraw: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}
