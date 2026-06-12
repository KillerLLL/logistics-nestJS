import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ description: '装货地名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '联系人' })
  @IsString()
  @MaxLength(50)
  linkman: string;

  @ApiProperty({ description: '联系方式' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ description: '省' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  province?: string;

  @ApiPropertyOptional({ description: '市' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  city?: string;

  @ApiPropertyOptional({ description: '区/县' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  district?: string;

  @ApiPropertyOptional({ description: '街道/乡镇' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  street?: string;

  @ApiPropertyOptional({ description: '完整行政区划' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addr?: string;

  @ApiPropertyOptional({ description: '地址编码 省,市,区,街道' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  addressCode?: string;

  @ApiPropertyOptional({ description: '详细地址' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  addressDetail?: string;

  @ApiPropertyOptional({ description: '所属区域全称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  wholeName?: string;

  @ApiPropertyOptional({ description: '所属区域 id' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  areaId?: string;

  @ApiPropertyOptional({ description: '是否默认 0-否 1-是' })
  @IsOptional()
  @IsInt()
  isDefault?: number;

  @ApiPropertyOptional({ description: '纬度' })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ description: '经度' })
  @IsOptional()
  @IsNumber()
  lng?: number;
}

export class UpdateAddressDto extends CreateAddressDto {
  @ApiProperty({ description: '地址 id' })
  @IsString()
  id: string;
}
