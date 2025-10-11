import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { IUser, UserRole } from './user.interface.js';

export class UserUpdateRequestDto {
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Username должен быть строкой' })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Неверный формат email' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'PIN должен быть строкой' })
  @MinLength(4, { message: 'PIN должен быть не менее 4 символов' })
  pin?: string;
}

export class UserUpdateResponseDto implements Partial<IUser> {
  userId!: number;
  name?: string;
  username?: string;
  tgId?: number;
  email?: string;
  role!: UserRole;
  balance!: number;
}

export class UserInfoResponseDto implements Partial<IUser> {
  userId!: number;
  name?: string;
  username?: string;
  tgId?: number;
  email?: string;
  role!: UserRole;
  balance!: number;
}
