// ============================================================
// result.ts — 统一响应格式
// 所有接口返回这个格式，前端统一处理
//
// 前端 request.js 中读取 res.data；本类同时输出 data 与 result 兼容老调用
// ============================================================

export class Result {
  static ok(data: any = null, message = '操作成功') {
    return {
      code: 200,
      message,
      data,
      result: data, // 兼容：保留旧字段
      success: true,
      timestamp: Date.now(),
    };
  }

  static fail(message = '操作失败', code = 500, data: any = null) {
    return {
      code,
      message,
      data,
      result: data, // 兼容
      success: false,
      timestamp: Date.now(),
    };
  }
}
