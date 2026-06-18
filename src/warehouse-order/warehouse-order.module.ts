import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseOrderController } from './warehouse-order.controller';
import { WarehouseOrderService } from './warehouse-order.service';
import { WarehouseOrder } from './warehouse-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WarehouseOrder])],
  controllers: [WarehouseOrderController],
  providers: [WarehouseOrderService],
})
export class WarehouseOrderModule {}
