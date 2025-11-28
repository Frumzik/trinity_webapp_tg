import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IUser, UserGender, UserRole } from './user.interface.js';
import { Types } from 'mongoose';
import { ISubscription } from '../subscription/subscription.interface.js';
import { Type } from 'class-transformer';

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

  @ApiProperty({ example: '$2b$10$hashedpassword', nullable: true })
  finPasswordHash!: string | null;

  @ApiProperty({ example: '0x13fasda...', nullable: true })
  address!: string | null;

  @ApiProperty({ example: 'Иван Иванов', nullable: true })
  name!: string | null;

  @ApiProperty({ example: 'ivan_tg', nullable: true })
  username!: string | null;

  @ApiProperty({ example: 175, nullable: true })
  height!: number | null;

  @ApiProperty({ example: 65, nullable: true })
  weight!: number | null;

  @ApiProperty({ example: new Date(), nullable: true })
  birthDate!: Date | null;

  @ApiProperty({ example: UserGender.MALE, nullable: true })
  gender!: UserGender | null;

  @ApiProperty({ example: '3/8/2', nullable: false })
  referralPath!: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.User,
    description: 'Роль пользователя',
  })
  role!: UserRole;

  @ApiProperty({ example: 250, description: 'Баланс пользователя' })
  balance!: number;

  @ApiProperty({ example: '5:10', description: 'Уведомления' })
  meditationNotifications!: string;

  @ApiProperty({ example: true, description: 'Уведомления' })
  contentNotifications!: boolean;

  @ApiProperty({ example: false, description: 'Уведомления' })
  promoNotifications!: boolean;

  @ApiProperty({ description: 'Удалён', example: false })
  deleted!: boolean;
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

  @ApiProperty({ example: 65, required: false })
  @IsOptional()
  @IsInt({ message: 'weight должно быть числом' })
  weight?: number;

  @ApiProperty({ example: 75, required: false })
  @IsOptional()
  @IsInt({ message: 'height должен быть числом' })
  height?: number;

  @ApiProperty({ example: new Date(), required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'birthDate должен быть датой' })
  birthDate?: Date;

  @ApiProperty({
    enum: UserGender,
    example: UserGender.MALE,
    description: 'Новый пользователя',
  })
  @IsEnum(UserGender, {
    message: 'Пол должен быть UserGender',
  })
  gender?: UserGender;
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

  @ApiProperty({
    example: 1,
    description: 'ID пользователя',
  })
  @IsInt()
  userId!: UserRole;
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
 * UPDATE FIN PASSWORD
 * ============================================================ */
export class UserUpdateFinPasswordRequestDto {
  @ApiProperty({ example: 'qwerty123', description: 'Новый пароль' })
  @IsString({ message: 'finPassword должен быть строкой' })
  @IsNotEmpty({ message: 'finPassword не может быть пустым' })
  finPassword!: string;
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
 * UPDATE NOTIFICATIONS
 * ============================================================ */

export class UserUpdateNotificationsRequestDto {
  @ApiProperty({ example: '10:00', description: 'Уведомления о медитациях' })
  @IsString({ message: 'meditationNotifications должен быть строкой' })
  meditationNotifications!: string;

  @ApiProperty({ example: true, description: 'Уведомления о контенте' })
  @IsBoolean({ message: 'contentNotifications должен быть true/false' })
  contentNotifications!: boolean;

  @ApiProperty({ example: true, description: 'Уведомления о промо' })
  @IsBoolean({ message: 'promoNotifications должен быть true/false' })
  promoNotifications!: boolean;
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
