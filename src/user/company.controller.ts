// ============================================================
// company.controller.ts — 平台托运人相关接口（对齐前端 /company/gyCompany/*）
//   POST /company/gyCompany/pqUpdate — 更新头像/姓名/公司名
//   GET  /company/gyCompany/enterpriseNews — 获取认证数据
//   PUT  /company/gyCompany/updateEnterpriseNews — 提交认证数据
// ============================================================

import { Controller, Post, Get, Put, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { PqUpdateDto } from './dto/user.dto';
import { CertificationDto } from './dto/certification.dto';
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

  @ApiOperation({ summary: '获取当前用户认证数据' })
  @Get('enterpriseNews')
  async getCertData(@CurrentUser() user: JwtPayload) {
    const data = await this.userService.getCertData(user.sub);
    return Result.ok(data);
  }

  @ApiOperation({ summary: '提交认证数据' })
  @Put('updateEnterpriseNews')
  async updateCertData(@CurrentUser() user: JwtPayload, @Body() dto: CertificationDto) {
    const data = await this.userService.updateCertData(user.sub, dto);
    return Result.ok(data, '提交成功');
  }
}
