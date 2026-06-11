// ============================================================
// app.module.ts — 根模块
// 1. 配置数据库连接（全局）
// 2. 导入各功能模块
// ============================================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderModule } from './order/order.module';
import { UserModule } from './user/user.module';
import { Order } from './order/order.entity';
import { User } from './user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '525619',
      database: 'logistics',
      charset: 'utf8mb4',
      entities: [Order, User],
      synchronize: true,
    }),
    OrderModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
