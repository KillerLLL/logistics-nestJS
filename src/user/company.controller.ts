// ============================================================
// company.controller.ts — 平台托运人相关接口（对齐前端 /company/gyCompany/*）
//   POST /company/gyCompany/pqUpdate — 更新头像/姓名/公司名
//   当前 UI 只支持改头像；后端预留 realname/companyName 字段
// ============================================================

import { Controller, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { PqUpdateDto } from './dto/user.dto';
import { Result } from '../common/result';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('公司模块')
@ApiBearerAuth('access-token')
@Controller('company/gyCompany')
export class CompanyController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '平台托运人更新个人资料（头像/姓名/公司名）' })
  @Post('pqUpdate')
  async pqUpdate(@CurrentUser() user: JwtPayload, @Body() dto: PqUpdateDto) {
    const msg = await this.userService.pqUpdate(user.sub, dto);
    return Result.ok(msg, msg);
  }
}
