// ============================================================
// main.ts — 应用入口
//   全局 ValidationPipe（白名单 + 禁用未知字段）
//   Swagger Bearer 鉴权定义
//   全局前缀为空（对齐前端调用路径）
// ============================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const globalPrefix = config.get<string>('globalPrefix') || 'logistics-boot';
  app.setGlobalPrefix(globalPrefix, {
    exclude: ['/', 'api-docs', 'swagger', 'swagger-json', 'health'],
  });

  // 全局入参校验
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ============ 接口文档配置 ============
  const docConfig = new DocumentBuilder()
    .setTitle('物流小程序 API')
    .setDescription('微信小程序端注册登录 + 一键登录 + 用户管理接口')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization', in: 'header' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('swagger', app, document);

  // Scalar 页面
  app.use('/api-docs', (req: any, res: any) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
  <title>物流小程序 API</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <script id="api-reference" data-url="/swagger-json"></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`);
  });

  // 根路由 + 健康检查
  app.getHttpAdapter().get('/', (_req: any, res: any) => {
    res.json({ name: 'uniapp-logistics', version: '0.0.1', ok: true });
  });
  app.getHttpAdapter().get('/health', (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = config.get<number>('port') || 3000;
  console.log(`接口文档(Swagger): http://localhost:${port}/swagger`);
  console.log(`接口文档(Scalar): http://localhost:${port}/api-docs`);
  await app.listen(port);
  console.log(`服务已启动: http://localhost:${port}`);
}
bootstrap();
