import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './address.dto';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Result } from '../common/result';

@ApiTags('地址簿')
@ApiBearerAuth('access-token')
@Controller('company/gyCompanyLoadAddr')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @ApiOperation({ summary: '地址簿列表（分页）' })
  @Get('list')
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('pageNo') pageNo = 1,
    @Query('pageSize') pageSize = 8,
    @Query('keywords') keywords?: string,
  ) {
    const data = await this.addressService.list(user.sub, +pageNo, +pageSize, keywords);
    return Result.ok(data, '查询成功');
  }

  @ApiOperation({ summary: '地址详情' })
  @Get('queryById')
  async queryById(
    @CurrentUser() user: JwtPayload,
    @Query('id') id: string,
  ) {
    const data = await this.addressService.findById(id, user.sub);
    if (!data) return Result.fail('地址不存在', 404);
    return Result.ok(data, '查询成功');
  }

  @ApiOperation({ summary: '新增地址' })
  @Post('add')
  async add(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAddressDto,
  ) {
    const data = await this.addressService.add(user.sub, dto);
    return Result.ok(data, '新增成功');
  }

  @ApiOperation({ summary: '编辑地址' })
  @Post('edit')
  async edit(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateAddressDto,
  ) {
    const data = await this.addressService.edit(user.sub, dto);
    if (!data) return Result.fail('地址不存在', 404);
    return Result.ok(data, '编辑成功');
  }

  @ApiOperation({ summary: '删除地址' })
  @Post('delete')
  async remove(
    @CurrentUser() user: JwtPayload,
    @Body('id') id: string,
  ) {
    const ok = await this.addressService.remove(id, user.sub);
    if (!ok) return Result.fail('删除失败', 400);
    return Result.ok(null, '删除成功');
  }
}
