import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { Address } from './address.entity';
import { UnloadAddressController } from './unload-address.controller';
import { UnloadAddressService } from './unload-address.service';
import { UnloadAddress } from './unload-address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address, UnloadAddress])],
  controllers: [AddressController, UnloadAddressController],
  providers: [AddressService, UnloadAddressService],
})
export class AddressModule {}
