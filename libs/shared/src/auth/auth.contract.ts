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
  @IsEnum(AuthType, { message: 'Тип аутентификации должен быть TG или EMAIL' })
  type!: AuthType;

  // Для TG
  @ValidateIf((o) => o.type === AuthType.TG)
  @IsNumber({}, { message: 'tgId должен быть числом' })
  @IsNotEmpty({ message: 'tgId не может быть пустым' })
  tgId!: number;

  @ValidateIf((o) => o.type === AuthType.TG)
  @IsString({ message: 'pin должен быть строкой' })
  @IsNotEmpty({ message: 'pin не может быть пустым' })
  @MinLength(4, { message: 'pin должен быть минимум 4 символа' })
  pin!: string;

  @ValidateIf((o) => o.type === AuthType.TG && o.email !== undefined)
  @IsNotEmpty({ message: 'Email не должен быть указан для TG регистрации' })
  _emailCheck?: never;

  @ValidateIf((o) => o.type === AuthType.TG && o.password !== undefined)
  @IsNotEmpty({ message: 'Пароль не должен быть указан для TG регистрации' })
  _passwordCheck?: never;

  // Для Email
  @ValidateIf((o) => o.type === AuthType.EMAIL)
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsNotEmpty({ message: 'Email не может быть пустым' })
  email!: string;

  @ValidateIf((o) => o.type === AuthType.EMAIL)
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @MinLength(6, { message: 'Пароль должен быть минимум 6 символов' })
  password!: string;

  @ValidateIf((o) => o.type === AuthType.EMAIL && o.tgId !== undefined)
  @IsNotEmpty({ message: 'tgId не должен быть указан для EMAIL регистрации' })
  _tgIdCheck?: never;

  @ValidateIf((o) => o.type === AuthType.EMAIL && o.pin !== undefined)
  @IsNotEmpty({ message: 'pin не должен быть указан для EMAIL регистрации' })
  _pinCheck?: never;

  // Остальные поля
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  name?: string;

  @ValidateIf((o) => o.type === AuthType.TG)
  @IsString({ message: 'Username должен быть строкой' })
  @IsOptional()
  username?: string;
}

export class AuthRegisterResponseDto {
  userId!: number;
}

export class AuthLoginRequestDto {
  @IsEnum(AuthType, { message: 'Тип аутентификации должен быть TG или EMAIL' })
  type!: AuthType;

  // Для TG
  @ValidateIf((o) => o.type === AuthType.TG)
  @IsNumber({}, { message: 'tgId должен быть числом' })
  tgId!: number;

  @ValidateIf((o) => o.type === AuthType.TG)
  @IsString({ message: 'pin должен быть строкой' })
  @IsNotEmpty({ message: 'pin не может быть пустым' })
  pin!: string;

  @ValidateIf((o) => o.type === AuthType.TG && o.email !== undefined)
  @IsNotEmpty({ message: 'email не должен быть указан для TG авторизации' })
  _emailCheck?: never;

  @ValidateIf((o) => o.type === AuthType.TG && o.password !== undefined)
  @IsNotEmpty({ message: 'password не должен быть указан для TG авторизации' })
  _passwordCheck?: never;

  // Для Email
  @ValidateIf((o) => o.type === AuthType.EMAIL)
  @IsEmail({}, { message: 'Некорректный формат email' })
  email!: string;

  @ValidateIf((o) => o.type === AuthType.EMAIL)
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  password!: string;

  @ValidateIf((o) => o.type === AuthType.EMAIL && o.tgId !== undefined)
  @IsNotEmpty({ message: 'tgId не должен быть указан для EMAIL авторизации' })
  _tgIdCheck?: never;

  @ValidateIf((o) => o.type === AuthType.EMAIL && o.pin !== undefined)
  @IsNotEmpty({ message: 'pin не должен быть указан для EMAIL авторизации' })
  _pinCheck?: never;
}

export class AuthLoginResponseDto {
  access_token!: string;
}
