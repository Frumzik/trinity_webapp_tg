import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { IUser, UserRole } from './user.interface.js';

export class UserUpdateRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
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
