// ============================================================
// login.dto.ts — 账号密码登录 DTO
// ============================================================

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: '登录账号' })
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: '123456', description: '登录密码' })
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  password: string;
}
