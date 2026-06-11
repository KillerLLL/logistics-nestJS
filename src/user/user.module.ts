// ============================================================
// user.module.ts — 用户模块
// ============================================================

import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthMiddleware } from './auth.middleware';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, AuthMiddleware],
})
export class UserModule {
  // 注册中间件：对所有 sys/ 下的路由生效
  // 这样 req.currentUser 就有值了
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('sys/*');
  }
}
