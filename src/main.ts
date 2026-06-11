// ============================================================
// main.ts — 应用入口文件
// ============================================================

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 设置全局前缀，和前端 API 路径保持一致
  // 这样 Controller 里写 sys/sms，实际路径就是 /logistics-boot/sys/sms
  // 但 /api-docs 和 /swagger 路径要排除，否则文档页面也会加前缀
  app.setGlobalPrefix('logistics-boot', {
    exclude: ['/', 'api-docs', 'swagger', 'health'],
  });

  // ============ 接口文档配置 ============
  const config = new DocumentBuilder()
    .setTitle('物流小程序 API')
    .setDescription('物流订单管理接口文档')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-Access-Token', in: 'header' }, 'token')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Swagger JSON 数据接口
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

  console.log('接口文档: http://localhost:3000/api-docs');
  await app.listen(3000);
  console.log('服务已启动: http://localhost:3000');
}
bootstrap();
