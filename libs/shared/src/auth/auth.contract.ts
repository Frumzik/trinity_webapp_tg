import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import { AuthType } from './auth.interface.js';

/* ============================================================
 * ENUM
 * ============================================================ */

/* ============================================================
 * AUTH REGISTER
 * ============================================================ */

@ApiExtraModels()
export class AuthRegisterEmailDto {
  @ApiProperty({ enum: AuthType, example: AuthType.EMAIL })
  @IsEnum(AuthType)
  type!: AuthType.EMAIL;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'qwerty123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Иван Иванов', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}

@ApiExtraModels()
export class AuthRegisterTgDto {
  @ApiProperty({ enum: AuthType, example: AuthType.TG })
  @IsEnum(AuthType)
  type!: AuthType.TG;

  @ApiProperty({ example: 123456789 })
  @IsNumber()
  tgId!: number;

  @ApiProperty({ example: '1234' })
  @IsString()
  @MinLength(4)
  pin!: string;

  @ApiProperty({ example: 'ivan_tg', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'Иван', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}

export class AuthRegisterResponseDto {
  @ApiProperty({ example: 1, description: 'ID созданного пользователя' })
  userId!: number;
}

/* ============================================================
 * AUTH LOGIN
 * ============================================================ */

@ApiExtraModels()
export class AuthLoginEmailDto {
  @ApiProperty({ enum: AuthType, example: AuthType.EMAIL })
  @IsEnum(AuthType)
  type!: AuthType.EMAIL;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'qwerty123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

@ApiExtraModels()
export class AuthLoginTgDto {
  @ApiProperty({ enum: AuthType, example: AuthType.TG })
  @IsEnum(AuthType)
  type!: AuthType.TG;

  @ApiProperty({ example: 123456789 })
  @IsNumber()
  tgId!: number;

  @ApiProperty({ example: '1234' })
  @IsString()
  @MinLength(4)
  pin!: string;
}

export class AuthLoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT-токен для авторизации',
  })
  access_token!: string;
}
