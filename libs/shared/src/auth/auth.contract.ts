import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { AuthType } from './auth.interface.js';

export class AuthRegisterRequestDto {
  @IsEnum(AuthType)
  type!: AuthType;

  // Для TG
  @ValidateIf((o) => o.type === AuthType.TG)
  @IsNumber()
  @IsNotEmpty()
  tgId!: number;

  @ValidateIf((o) => o.type === AuthType.TG)
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  pin!: string;

  // Для Email
  @ValidateIf((o) => o.type === AuthType.EMAIL)
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ValidateIf((o) => o.type === AuthType.EMAIL)
  @IsString()
  @IsNotEmpty()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @ValidateIf((o) => o.type === AuthType.TG)
  @IsString()
  @IsOptional()
  username?: string;
}

export class AuthRegisterResponseDto {
  userId!: number;
}

export class AuthLoginRequestDto {
  @IsEnum(AuthType)
  type!: AuthType;

  // Для TG
  @ValidateIf((o) => o.type === AuthType.TG)
  @IsNumber()
  tgId!: number;

  @ValidateIf((o) => o.type === AuthType.TG)
  @IsString()
  @IsNotEmpty()
  pin!: string;

  // Для Email
  @ValidateIf((o) => o.type === AuthType.EMAIL)
  @IsEmail()
  email!: string;

  @ValidateIf((o) => o.type === AuthType.EMAIL)
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class AuthLoginResponseDto {
  access_token!: string;
}
