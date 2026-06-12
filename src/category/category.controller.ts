// ============================================================
// category.controller.ts — 字典分类控制器
//   GET /sys/category/loadTreeData   — 获取产业类型树
//   GET /sys/category/loadDictItem/  — 根据 key 获取显示名称
// ============================================================

import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { Result } from '../common/result';

@ApiTags('字典分类')
@ApiBearerAuth('access-token')
@Controller('sys/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: '获取产业类型树' })
  @Get('loadTreeData')
  async loadTreeData(@Query('pcode') pcode?: string) {
    const data = this.categoryService.loadTreeData(pcode);
    return Result.ok(data);
  }

  @ApiOperation({ summary: '根据 key 获取显示名称' })
  @Get('loadDictItem/')
  async loadDictItem(@Query('ids') ids: string) {
    const data = this.categoryService.loadDictItem(ids);
    return Result.ok(data);
  }
}
