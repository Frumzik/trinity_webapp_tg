import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IUser, UserRole } from './user.interface.js';
import { Types } from 'mongoose';
import { ISubscription } from '../subscription/subscription.interface.js';

/* ============================================================
 * USER INFO
 * ============================================================ */

export class UserInfoResponseDto implements IUser {
  @ApiProperty({ example: '671b2e9fa91d3f001c4c1234' })
  _id?: Types.ObjectId;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: null, description: 'ID подписки (Mongo ObjectId)' })
  subscription!: Types.ObjectId | ISubscription | null;

  @ApiProperty({ example: null, description: 'ID подписки (числовой)' })
  subscriptionId!: number | null;

  @ApiProperty({ example: 123456789, nullable: true })
  tgId!: number | null;

  @ApiProperty({ example: '$2b$10$somethinghashed', nullable: true })
  pinHash!: string | null;

  @ApiProperty({ example: 'user@example.com', nullable: true })
  email!: string | null;

  @ApiProperty({ example: '$2b$10$hashedpassword', nullable: true })
  passwordHash!: string | null;

  @ApiProperty({ example: 'Иван Иванов', nullable: true })
  name!: string | null;

  @ApiProperty({ example: 'ivan_tg', nullable: true })
  username!: string | null;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.User,
    description: 'Роль пользователя',
  })
  role!: UserRole;

  @ApiProperty({ example: 250, description: 'Баланс пользователя' })
  balance!: number;
}

/* ============================================================
 * UPDATE PROFILE
 * ============================================================ */

export class UserUpdateProfileRequestDto {
  @ApiProperty({ example: 'Иван Иванов', required: false })
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  name?: string;

  @ApiProperty({ example: 'ivan_tg', required: false })
  @IsOptional()
  @IsString({ message: 'Username должен быть строкой' })
  username?: string;
}

/* ============================================================
 * UPDATE ROLE
 * ============================================================ */

export class UserUpdateRoleRequestDto {
  @ApiProperty({
    enum: UserRole,
    example: UserRole.User,
    description: 'Новая роль пользователя',
  })
  @IsEnum(UserRole, {
    message: 'Роль должна быть USER, MODERATOR или ADMIN',
  })
  role!: UserRole;
}

/* ============================================================
 * UPDATE PIN
 * ============================================================ */

export class UserUpdatePinRequestDto {
  @ApiProperty({ example: '1234', description: 'Новый PIN-код' })
  @IsString({ message: 'pin должен быть строкой' })
  @IsNotEmpty({ message: 'pin не может быть пустым' })
  pin!: string;
}

/* ============================================================
 * UPDATE PASSWORD
 * ============================================================ */

export class UserUpdatePasswordRequestDto {
  @ApiProperty({ example: 'qwerty123', description: 'Новый пароль' })
  @IsString({ message: 'password должен быть строкой' })
  @IsNotEmpty({ message: 'password не может быть пустым' })
  password!: string;
}

/* ============================================================
 * UPDATE EMAIL
 * ============================================================ */

export class UserUpdateEmailRequestDto {
  @ApiProperty({ example: 'user@example.com', description: 'Новый email' })
  @IsEmail()
  @IsString({ message: 'email должен быть строкой' })
  @IsNotEmpty({ message: 'email не может быть пустым' })
  email!: string;
}

/* ============================================================
 * UPDATE RESPONSE
 * ============================================================ */

export class UserUpdateResponseDto extends UserInfoResponseDto {}

/* ============================================================
 * BALANCE
 * ============================================================ */

export class UserBalanceIncRequestDto {
  @ApiProperty({ example: 100, description: 'На сколько увеличить баланс' })
  @IsInt({ message: 'inc должен быть числом' })
  inc!: number;
}

export class UserBalanceDecRequestDto {
  @ApiProperty({ example: 50, description: 'На сколько уменьшить баланс' })
  @IsInt({ message: 'dec должен быть числом' })
  dec!: number;
}
