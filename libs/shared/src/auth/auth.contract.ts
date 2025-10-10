import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { AuthType } from './auth.interface.js';

export class AuthRegisterDto {
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
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @ValidateIf((o) => o.type === AuthType.TG)
  @IsString()
  @IsOptional()
  username?: string;
}

export class AuthLoginDto {
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

export class RegisterResponseDto {
  tgId!: number;
}

export class LoginResponseDto {
  access_token!: string;
}
