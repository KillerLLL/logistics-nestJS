// ============================================================
// auth.controller.ts — 认证控制器
//   POST /logistics-boot/auth/login
//   POST /logistics-boot/auth/refresh
//   POST /logistics-boot/auth/logout  (需登录)
// ============================================================

import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Result } from '../common/result';

@ApiTags('认证模块')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: '账号密码登录' })
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const data = await this.authService.login(dto.username, dto.password, req.ip);
    return Result.ok(data, '登录成功');
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'refresh token 刷新 access token' })
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: any) {
    const data = await this.authService.refresh(dto.refreshToken, req.ip);
    return Result.ok(data, '刷新成功');
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '退出登录' })
  @Post('logout')
  async logout(@CurrentUser() user: JwtPayload, @Req() req: any) {
    await this.authService.logout(user.sub, req.body?.refreshToken);
    return Result.ok({ ok: true }, '退出成功');
  }
}
