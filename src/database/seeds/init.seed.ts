// ============================================================
// init.seed.ts — 种子脚本
//   注入测试账号：admin/123456、shipper01/123456、driver01/123456
//   执行：npm run seed
//   中文 nickname：管理员 / 货主一号 / 司机一号
//   依赖数据库 charset=utf8mb4（见 1718000300000-ConvertToUtf8mb4 migration）
// ============================================================

import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../user/user.entity';
import { Order } from '../../order/order.entity';
import { Wallet } from '../../wallet/wallet.entity';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'logistics',
  charset: 'utf8mb4',
  entities: [User, Order, Wallet],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
});

const SEED_USERS = [
  { username: 'admin', password: '123456', nickname: '管理员', realname: '系统管理员', role: 'admin' as const, phone: '13800000001' },
  { username: 'shipper01', password: '123456', nickname: '货主一号', realname: '张三', role: 'shipper' as const, phone: '13800000002' },
  { username: 'driver01', password: '123456', nickname: '司机一号', realname: '李四', role: 'driver' as const, phone: '13800000003' },
];

async function main() {
  await dataSource.initialize();
  console.log('[seed] DB connected (charset=utf8mb4)');
  const repo = dataSource.getRepository(User);
  for (const s of SEED_USERS) {
    const exists = await repo.findOne({ where: [{ username: s.username }, { phone: s.phone }] });
    if (exists) {
      // 关键：utf8mb4 迁移后，重新写回中文 nickname / realname（之前是 ?）
      // 同步把 activeStatus 补成 1（旧种子没写过）
      const needRewrite =
        exists.nickname !== s.nickname ||
        exists.realname !== s.realname ||
        exists.activeStatus !== 1;
      if (needRewrite) {
        exists.nickname = s.nickname;
        exists.realname = s.realname;
        exists.activeStatus = 1;
        await repo.save(exists);
        console.log(`[seed] updated existing user: ${s.username} (rewrote Chinese fields)`);
      } else {
        console.log(`[seed] skip existing user: ${s.username}`);
      }
      continue;
    }
    const passwordHash = await bcrypt.hash(s.password, 10);
    const u = repo.create({
      username: s.username,
      passwordHash,
      nickname: s.nickname,
      realname: s.realname,
      phone: s.phone,
      role: s.role,
      status: 1,
      activeStatus: 1,
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
