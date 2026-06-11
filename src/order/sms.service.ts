// ============================================================
// sms.service.ts — 短信通知服务
// 独立拆分出来，和 OrderService 解耦
//
// 为什么要拆？
// - 发短信可能被多处调用（下单、签收、退款……）
// - 后续可能换成阿里云短信、腾讯云短信，只改这一个文件
// - 拆出来后 OrderService 不用关心短信怎么发的
// ============================================================

import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  // 发送短信通知（这里 console.log 模拟，实际项目会调短信服务商 API）
  send(phone: string, message: string) {
    console.log(`[短信] 发送到 ${phone}: ${message}`);
  }
}
