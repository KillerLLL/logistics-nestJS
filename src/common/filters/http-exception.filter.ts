// ============================================================
// http-exception.filter.ts — 全局异常过滤器
// 把 HttpException 与未知异常统一包装为 Result 形态：
//   { code, message, data: null, result: null, success: false, timestamp }
// 同时对业务码和 HTTP 状态码做映射（401/403/422/500）
// ============================================================

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Result } from '../result';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let businessCode = 500;
    let message: string | object = '服务器内部错误';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const resp = exception.getResponse();
      message = typeof resp === 'string' ? resp : (resp as any).message ?? resp;

      switch (httpStatus) {
        case HttpStatus.UNAUTHORIZED:
          businessCode = 401;
          if (typeof message === 'string') message = 'token 失效或未登录';
          break;
        case HttpStatus.FORBIDDEN:
          businessCode = 403;
          if (typeof message === 'string') message = '权限不足';
          break;
        case HttpStatus.NOT_FOUND:
          businessCode = 404;
          break;
        case HttpStatus.UNPROCESSABLE_ENTITY:
        case HttpStatus.BAD_REQUEST:
          businessCode = httpStatus === 422 ? 422 : 400;
          break;
        default:
          businessCode = httpStatus;
      }
    } else {
      this.logger.error(
        `Unhandled exception on ${req.method} ${req.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body = Result.fail(
      typeof message === 'string' ? message : JSON.stringify(message),
      businessCode,
    );

    res.status(httpStatus).json(body);
  }
}
