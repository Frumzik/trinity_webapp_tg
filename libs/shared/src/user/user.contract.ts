import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IUser, UserRole } from './user.interface.js';
import { Types } from 'mongoose';
import { ISubscription } from '../subscription/subscription.interface.js';

// user
export class UserInfoResponseDto implements IUser {
  _id?: Types.ObjectId;
  userId!: number;

  // Ссылки
  subscription!: Types.ObjectId | ISubscription | null;
  subscriptionId!: number | null;

  // Credentials
  tgId!: number | null;
  pinHash!: string | null;
  email!: string | null;
  passwordHash!: string | null;

  // Метаинформация
  name!: string | null;
  username!: string | null;

  // Other
  role!: UserRole;
  balance!: number;
}

// update/profile
export class UserUpdateProfileRequestDto {
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Username должен быть строкой' })
  username?: string;
}

// update/role
export class UserUpdateRoleRequestDto {
  @IsEnum(UserRole, { message: 'Роль должна быть USER or MODERATOR or ADMIN' })
  role!: UserRole;
}

// update/pin
export class UserUpdatePinRequestDto {
  @IsString({ message: 'pin должен быть строкой' })
  @IsNotEmpty({ message: 'pin не может быть пустым' })
  pin!: string;
}

// update/password
export class UserUpdatePasswordRequestDto {
  @IsString({ message: 'password должен быть строкой' })
  @IsNotEmpty({ message: 'password не может быть пустым' })
  password!: string;
}

// update/email
export class UserUpdateEmailRequestDto {
  @IsEmail()
  @IsString({ message: 'email должен быть строкой' })
  @IsNotEmpty({ message: 'email не может быть пустым' })
  email!: string;
}

// update/*
export class UserUpdateResponseDto extends UserInfoResponseDto {}


// balance/inc
export class UserBalanceIncRequestDto {
  @IsInt({ message: 'inc должен быть числом' })
  inc!: number;
}

// balance/inc
export class UserBalanceDecRequestDto {
  @IsInt({ message: 'dec должен быть числом' })
  dec!: number;
}
