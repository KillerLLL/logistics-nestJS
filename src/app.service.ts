// ============================================================
// app.service.ts — 服务层
// 作用：存放业务逻辑和数据处理，供 Controller 调用
// 类比前端：
//   - 类似 Vuex/Pinia 的 store 或 React 的自定义 Hook
//   - 把数据获取和处理逻辑从视图层抽离出来
//   - Controller 是「页面」，Service 是「数据层」
// ============================================================

import { Injectable } from '@nestjs/common';

// @Injectable() 装饰器：声明该类可以被「依赖注入」到其他类中
// 只有加了 @Injectable() 的类才能写在 @Module() 的 providers 里
// 才能被 Controller 通过构造函数注入使用
@Injectable()
export class AppService {
  // 业务方法：返回一条问候语
  // 实际项目中，这里通常会连接数据库、调用外部 API 等
  getHello(): string {
    return 'Hello World!';
  }
}
