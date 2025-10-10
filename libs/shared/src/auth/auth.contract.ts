import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export enum AuthType {
  TG = 'TG',
  EMAIL = 'EMAIL',
}

export class AuthRegisterDto {
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

  @IsOptional()
  @IsString()
  name?: string;

  @ValidateIf((o) => o.type === AuthType.TG)
  @IsString()
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
