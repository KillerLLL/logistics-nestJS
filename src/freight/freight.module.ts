import { Module } from '@nestjs/common';
import { FreightController } from './freight.controller';
import { FreightService } from './freight.service';

/**
 * 进仓报价模块。
 * 仓库列表与报价规则均为内置死数据（见 freight.service.ts），
 * 无需数据库表，因此不引入 TypeOrmModule。
 */
@Module({
  controllers: [FreightController],
  providers: [FreightService],
})
export class FreightModule {}
