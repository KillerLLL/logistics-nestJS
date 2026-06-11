// ============================================================
// wallet.controller.ts — 钱包控制器
//   前端登录后立即调用的"我的钱包"接口
//   路由前缀按前端硬编码路径走：
//     GET /wallet/shipper/wallet/my   （货主）
//     GET /wallet/driver/wallet/my    （司机，备用）
// ============================================================

import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Result } from '../common/result';

@ApiTags('钱包模块')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiBearerAuth('access-token')
  @Roles('shipper')
  @ApiOperation({ summary: '货主钱包-我的' })
  @Get('shipper/wallet/my')
  async shipperMy(@CurrentUser() user: JwtPayload) {
    const wallet = await this.walletService.getOrCreate(user.sub, 'shipper');
    return Result.ok(this.walletService.toViewModel(wallet), '查询成功');
  }

  @ApiBearerAuth('access-token')
  @Roles('driver')
  @ApiOperation({ summary: '司机钱包-我的' })
  @Get('driver/wallet/my')
  async driverMy(@CurrentUser() user: JwtPayload) {
    const wallet = await this.walletService.getOrCreate(user.sub, 'driver');
    return Result.ok(this.walletService.toViewModel(wallet), '查询成功');
  }
}
