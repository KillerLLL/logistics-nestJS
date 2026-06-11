# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev          # 开发模式（--watch 热重载）
npm run build              # 编译到 dist/
npm run start:prod         # 生产模式（需先 build）
npm run seed               # 注入测试账号（admin/shipper01/driver01，密码 123456）
npm run migration:generate # 生成 TypeORM migration（需指定 name 参数）
npm run migration:run      # 执行 migration
npm run migration:revert   # 回滚最近一条 migration
```

无 lint/test 脚本，项目中未配置 ESLint 或测试框架。

## Tech Stack

- NestJS 11 + TypeScript (target ES2021, commonjs)
- TypeORM + MySQL (mysql2 driver)
- Passport + JWT (双 token：access + refresh)
- class-validator / class-transformer (DTO 校验)
- Swagger (SwaggerModule) + Scalar (/api-docs)
- ThrottlerModule (全局 60 req/min/IP)
- joi (.env 启动校验)

## Architecture

全局 API 前缀：`logistics-boot`（由 `.env` 的 `GLOBAL_PREFIX` 控制）。健康检查和文档页排除在全局前缀外。

### 鉴权模型

全局三重 Guard，声明顺序即执行顺序：`JwtAuthGuard → ThrottlerGuard → RolesGuard`。

- **JwtAuthGuard**：所有路由默认需要 `Authorization: Bearer <access-token>`。用 `@Public()` 装饰器跳过。
- **RolesGuard**：配合 `@Roles('admin', 'driver')` 做角色校验，无 `@Roles` 则不限。
- **ThrottlerGuard**：全局 60 req/min/IP；个别路由用 `@Throttle()` 覆盖。

JWT payload 包含 `jwtVersion` 字段。退出登录或踢人时 `user.jwtVersion + 1`，使旧 access token 失效。Refresh token 以 SHA256 哈希存入 `user.refreshTokenHash`，轮换时覆盖。

### 统一响应

所有接口返回 `Result.ok()` / `Result.fail()` 格式：
```json
{ "code": 200, "message": "...", "data": {}, "result": {}, "success": true, "timestamp": 123456 }
```
`result` 字段是 `data` 的别名，为兼容旧版前端。全局 `HttpExceptionFilter` 将异常也包装为此格式。

### 模块结构

| 模块 | 路径 | 职责 |
|------|------|------|
| AuthModule | `src/auth/` | 账号密码登录、refresh 刷新、logout、JWT 签发 |
| UserModule | `src/user/` | 用户 CRUD、旧 /sys/* 兼容路由（已 @Deprecated） |
| OrderModule | `src/order/` | 订单 CRUD、FeeService 运费计算、SmsService 短信 |
| WechatModule | `src/wechat/` | 微信小程序 jsCode 登录、手机号解密绑定 |

模块间依赖：WechatModule → AuthModule（复用 AuthService 签发 token）。AuthModule 通过 TypeOrmModule 直接注入 User 实体的 Repository。

### Entity

Entity 手动注册在两处：
1. `app.module.ts` 的 `TypeOrmModule.forRootAsync` → `entities: [Order, User]`
2. `database/data-source.ts` → CLI migration 用

新增 Entity 时两处都要加。`synchronize` 由 `.env` 的 `DB_SYNCHRONIZE` 控制。

### 环境变量

`src/config/configuration.ts` 集中读取并结构化为 `AppConfig`。`src/config/validation.ts` 用 joi 校验必填项，启动时缺 `DB_USER`/`JWT_ACCESS_SECRET` 等直接报错。开发用 `.env`，模板见 `.env.example`。

### 微信沙箱模式

`WxMpClient` 当 `WX_MP_SECRET` 为空或以 `__` 开头时自动启用 mock 模式：jsCode 通过 MD5 生成稳定 mock openid，手机号解密直接回传输入值。填入真实 AppSecret 后自动切换为调用微信 API。

### DTO

放在各模块的 `dto/` 子目录。全局 `ValidationPipe` 配置为 `whitelist: true` + `forbidNonWhitelisted: true`，多余字段会被丢弃并报错。

### API 文档

- Swagger JSON：`/swagger-json`
- Swagger UI：`/swagger`
- Scalar：`/api-docs`
