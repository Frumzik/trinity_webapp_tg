import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IUser, UserRole } from './user.interface.js';

export class UserUpdateProfileRequestDto {
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Username должен быть строкой' })
  username?: string;
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

export class UserUpdateRoleRequestDto {
  @IsEnum(UserRole, { message: 'Роль должна быть USER or MODERATOR or ADMIN' })
  role!: UserRole;
}
