// ============================================================
// wallet.service.ts — 钱包服务层
//   getOrCreate(userId, ownerType)：自动开户（首次访问 / 角色变更）
//   toViewModel(wallet)：转前端 ShipperWalletMyVo 字符级一致结构
// ============================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletOwnerType } from './wallet.entity';

export interface WalletView {
  balance: number;
  availableAmount: number;
  withdrawingAmount: number;
  totalIncome: number;
  settledIncome: number;
  pendingIncome: number;
  totalWithdraw: number;
}

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
  ) {}

  async getOrCreate(userId: string, ownerType: WalletOwnerType): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({ where: { userId } });
    if (wallet) {
      if (wallet.ownerType !== ownerType) {
        wallet.ownerType = ownerType;
        await this.walletRepo.save(wallet);
      }
      return wallet;
    }
    wallet = this.walletRepo.create({ userId, ownerType });
    return this.walletRepo.save(wallet);
  }

  toViewModel(wallet: Wallet): WalletView {
    return {
      balance: Number(wallet.balance),
      availableAmount: Number(wallet.availableAmount),
      withdrawingAmount: Number(wallet.withdrawingAmount),
      totalIncome: Number(wallet.totalIncome),
      settledIncome: Number(wallet.settledIncome),
      pendingIncome: Number(wallet.pendingIncome),
      totalWithdraw: Number(wallet.totalWithdraw),
    };
  }
}
