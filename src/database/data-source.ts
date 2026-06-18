// ============================================================
// data-source.ts — typeorm CLI 用
// 跑 `npm run migration:generate` / `migration:run` 时通过本文件连接
// ============================================================

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../user/user.entity';
import { Order } from '../order/order.entity';
import { Wallet } from '../wallet/wallet.entity';
import { Address } from '../address/address.entity';
import { UnloadAddress } from '../address/unload-address.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'logistics',
  charset: 'utf8mb4',
  entities: [User, Order, Wallet, Address, UnloadAddress],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
});
