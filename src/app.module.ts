// ============================================================
// app.module.ts — 根模块
//   1. ConfigModule（统一 .env 入口 + joi 校验）
//   2. TypeORM（DB 配置来自 .env，synchronize 由 .env 控制）
//   3. ThrottlerModule（登录 5 req/min/IP 等限流）
//   4. APP_GUARD：JwtAuthGuard（全路由默认鉴权，@Public() 跳过）
//   5. APP_FILTER：HttpExceptionFilter（统一异常包装）
// ============================================================

import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import configuration from './config/configuration';
import { envValidationSchema } from './config/validation';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderModule } from './order/order.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { WechatModule } from './wechat/wechat.module';
import { WalletModule } from './wallet/wallet.module';
import { OssModule } from './oss/oss.module';
import { OcrModule } from './ocr/ocr.module';
import { CategoryModule } from './category/category.module';
import { AddressModule } from './address/address.module';
import { Order } from './order/order.entity';
import { User } from './user/user.entity';
import { Wallet } from './wallet/wallet.entity';
import { Address } from './address/address.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: { allowUnknown: true, abortEarly: false },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'mysql',
        host: cfg.get<string>('database.host'),
        port: cfg.get<number>('database.port'),
        username: cfg.get<string>('database.username'),
        password: cfg.get<string>('database.password'),
        database: cfg.get<string>('database.database'),
        charset: cfg.get<string>('database.charset') || 'utf8mb4',
        entities: [Order, User, Wallet, Address],
        synchronize: cfg.get<boolean>('database.synchronize'),
        autoLoadEntities: true,
      }),
    }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 60 },
    ]),
    AuthModule,
    WechatModule,
    UserModule,
    OrderModule,
    WalletModule,
    OssModule,
    OcrModule,
    CategoryModule,
    AddressModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
