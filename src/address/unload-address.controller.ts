import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UnloadAddressService } from './unload-address.service';
import { CreateAddressDto, UpdateAddressDto } from './address.dto';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Result } from '../common/result';

/**
 * 收货地址（卸货地）接口。
 * 路由对齐前端 /logistics-boot/company/gyCompanyUnLoadAddr/，
 * 出入参与发货地址（AddressController）完全一致。
 */
@ApiTags('地址簿-收货')
@ApiBearerAuth('access-token')
@Controller('company/gyCompanyUnLoadAddr')
export class UnloadAddressController {
  constructor(private readonly unloadAddressService: UnloadAddressService) {}

  @ApiOperation({ summary: '收货地址列表（分页）' })
  @Get('list')
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('pageNo') pageNo = 1,
    @Query('pageSize') pageSize = 8,
    @Query('keywords') keywords?: string,
  ) {
    const data = await this.unloadAddressService.list(user.sub, +pageNo, +pageSize, keywords);
    return Result.ok(data, '查询成功');
  }

  @ApiOperation({ summary: '收货地址详情' })
  @Get('queryById')
  async queryById(
    @CurrentUser() user: JwtPayload,
    @Query('id') id: string,
  ) {
    const data = await this.unloadAddressService.findById(id, user.sub);
    if (!data) return Result.fail('地址不存在', 404);
    return Result.ok(data, '查询成功');
  }

  @ApiOperation({ summary: '新增收货地址' })
  @Post('add')
  async add(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAddressDto,
  ) {
    const data = await this.unloadAddressService.add(user.sub, dto);
    return Result.ok(data, '新增成功');
  }

  @ApiOperation({ summary: '编辑收货地址' })
  @Post('edit')
  async edit(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateAddressDto,
  ) {
    const data = await this.unloadAddressService.edit(user.sub, dto);
    if (!data) return Result.fail('地址不存在', 404);
    return Result.ok(data, '编辑成功');
  }

  @ApiOperation({ summary: '删除收货地址' })
  @Post('delete')
  async remove(
    @CurrentUser() user: JwtPayload,
    @Body('id') id: string,
  ) {
    const ok = await this.unloadAddressService.remove(id, user.sub);
    if (!ok) return Result.fail('删除失败', 400);
    return Result.ok(null, '删除成功');
  }
}
