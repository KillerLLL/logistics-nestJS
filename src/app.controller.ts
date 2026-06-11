// ============================================================
// app.controller.ts — 控制器
// 作用：接收 HTTP 请求，返回响应（定义路由和处理函数）
// 类比前端：类似 Vue Router 中的路由配置
//   - @Get() 相当于 router.get('/path', handler)
//   - 整个 Controller 相当于一组路由的集合
// ============================================================

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// @Controller() 装饰器：声明这是一个控制器
// 可以传参指定路由前缀，如 @Controller('users') 则路由为 /users/*
// 不传参则直接匹配根路径 /
@Controller()
export class AppController {
  // 依赖注入（Dependency Injection，简称 DI）
  // 在构造函数中声明需要的服务，NestJS 会自动创建并传入实例
  // 类比前端：类似 Vue 的 inject() 或 React 的 useContext()
  // private readonly = 自动声明为类属性，等价于 this.appService
  constructor(private readonly appService: AppService) {}

  // @Get() 装饰器：将该方法映射为 GET 请求的处理函数
  // 不传参 → 匹配 GET /
  // 类比前端：类似 axios.get('/') 的服务端对应处理
  @Get()
  getHello(): string {
    // 调用 Service 中的方法获取数据
    return this.appService.getHello();
  }

  // @Get('health') → 匹配 GET /health
  // 控制器可以直接返回对象，NestJS 会自动序列化为 JSON 响应
  // 类比前端：类似 res.json({ ... })（Express 写法）
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
