// ============================================================
// init.seed.ts — 种子脚本
//   注入测试账号：admin/123456、shipper01/123456、driver01/123456
//   执行：npm run seed
// ============================================================

import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../user/user.entity';
import { Order } from '../../order/order.entity';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'logistics',
  charset: 'utf8mb4',
  entities: [User, Order],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
});

const SEED_USERS = [
  { username: 'admin', password: '123456', nickname: '管理员', role: 'admin' as const, phone: '13800000001' },
  { username: 'shipper01', password: '123456', nickname: '货主一号', role: 'shipper' as const, phone: '13800000002' },
  { username: 'driver01', password: '123456', nickname: '司机一号', role: 'driver' as const, phone: '13800000003' },
];

async function main() {
  await dataSource.initialize();
  console.log('[seed] DB connected');
  const repo = dataSource.getRepository(User);
  for (const s of SEED_USERS) {
    const exists = await repo.findOne({ where: [{ username: s.username }, { phone: s.phone }] });
    if (exists) {
      console.log(`[seed] skip existing user: ${s.username}`);
      continue;
    }
    const passwordHash = await bcrypt.hash(s.password, 10);
    const u = repo.create({
      username: s.username,
      passwordHash,
      nickname: s.nickname,
      phone: s.phone,
      role: s.role,
      status: 1,
      certStatus: '0',
    });
    await repo.save(u);
    console.log(`[seed] inserted user: ${s.username} (${s.role})`);
  }
  await dataSource.destroy();
  console.log('[seed] done');
}

main().catch((e) => {
  console.error('[seed] failed', e);
  process.exit(1);
});
