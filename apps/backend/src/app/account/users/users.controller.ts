import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JWTAuthGuard, Roles, UserId } from '../../service';
import { UsersService } from './users.service';
import {
  UserBalanceDecRequestDto,
  UserBalanceIncRequestDto,
  UserInfoResponseDto,
  UserRole,
  UserUpdateEmailRequestDto,
  UserUpdateFinPasswordRequestDto,
  UserUpdateNotificationsRequestDto,
  UserUpdatePasswordRequestDto,
  UserUpdatePinRequestDto,
  UserUpdateProfileRequestDto,
  UserUpdateResponseDto,
  UserUpdateRoleRequestDto,
} from '@trinity/shared';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth('access_token')
@UseGuards(JWTAuthGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить информацию о пользователе' })
  @ApiResponse({ type: UserInfoResponseDto })
  @ApiQuery({
    name: 'populate',
    required: false,
    type: Boolean,
    description: 'Если true — вернуть данные с полной информацией (populate)',
    example: false,
  })
  async info(
    @UserId() userId: number,
    @Query('populate') populate?: boolean
  ): Promise<UserInfoResponseDto> {
    const user = populate
      ? await this.usersService.populate({ userId })
      : await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  @Post('update/profile')
  @ApiOperation({ summary: 'Обновить профиль пользователя' })
  @ApiBody({ type: UserUpdateProfileRequestDto })
  @ApiResponse({ type: UserUpdateResponseDto })
  async updateProfile(
    @UserId() userId: number,
    @Body() updateData: UserUpdateProfileRequestDto
  ): Promise<UserUpdateResponseDto> {
    return this.usersService.updateProfile({ userId }, updateData);
  }

  @Post('update/role')
  @ApiOperation({ summary: 'Изменить роль пользователя' })
  @Roles(UserRole.Admin, UserRole.Moderator)
  @ApiBody({ type: UserUpdateRoleRequestDto })
  @ApiResponse({ type: UserUpdateResponseDto })
  async updateRole(
    @Body() updateData: UserUpdateRoleRequestDto
  ): Promise<UserUpdateResponseDto> {
    return this.usersService.updateRole(
      { userId: updateData.userId },
      updateData
    );
  }

  @Post('update/pin')
  @ApiOperation({ summary: 'Изменить PIN-код' })
  @ApiBody({ type: UserUpdatePinRequestDto })
  @ApiResponse({ type: UserUpdateResponseDto })
  async updatePin(
    @UserId() userId: number,
    @Body() updateData: UserUpdatePinRequestDto
  ): Promise<UserUpdateResponseDto> {
    return this.usersService.updatePin({ userId }, updateData);
  }

  @Post('update/password')
  @ApiOperation({ summary: 'Изменить пароль пользователя' })
  @ApiBody({ type: UserUpdatePasswordRequestDto })
  @ApiResponse({ type: UserUpdateResponseDto })
  async updatePassword(
    @UserId() userId: number,
    @Body() updateData: UserUpdatePasswordRequestDto
  ): Promise<UserUpdateResponseDto> {
    return this.usersService.updatePassword({ userId }, updateData);
  }

  @Post('update/fin-password')
  @ApiOperation({ summary: 'Изменить финансовый пароль пользователя' })
  @ApiBody({ type: UserUpdateFinPasswordRequestDto })
  @ApiResponse({ type: UserUpdateResponseDto })
  async updateFinPassword(
    @UserId() userId: number,
    @Body() updateData: UserUpdateFinPasswordRequestDto
  ): Promise<UserUpdateResponseDto> {
    return this.usersService.updateFinPassword({ userId }, updateData);
  }

  @Post('update/email')
  @ApiOperation({ summary: 'Изменить email пользователя' })
  @ApiBody({ type: UserUpdateEmailRequestDto })
  @ApiResponse({ type: UserUpdateResponseDto })
  async updateEmail(
    @UserId() userId: number,
    @Body() updateData: UserUpdateEmailRequestDto
  ): Promise<UserUpdateResponseDto> {
    return this.usersService.updateEmail({ userId }, updateData);
  }

  @Post('balance/inc')
  @ApiOperation({ summary: 'Увеличить баланс пользователя' })
  @ApiBody({ type: UserBalanceIncRequestDto })
  @ApiResponse({ type: UserUpdateResponseDto })
  @Roles(UserRole.Admin, UserRole.Moderator)
  async incBalance(
    @UserId() userId: number,
    @Body() updateData: UserBalanceIncRequestDto
  ): Promise<UserUpdateResponseDto> {
    return this.usersService.incBalance({ userId }, updateData);
  }

  @Post('balance/dec')
  @ApiOperation({ summary: 'Уменьшить баланс пользователя' })
  @ApiBody({ type: UserBalanceDecRequestDto })
  @ApiResponse({ type: UserUpdateResponseDto })
  @Roles(UserRole.Admin, UserRole.Moderator)
  async decBalance(
    @UserId() userId: number,
    @Body() updateData: UserBalanceDecRequestDto
  ): Promise<UserUpdateResponseDto> {
    return this.usersService.decBalance({ userId }, updateData);
  }

  @Post('update/notifications')
  @ApiOperation({ summary: 'Изменить уведомления пользователя' })
  @ApiBody({ type: UserUpdateNotificationsRequestDto })
  @ApiResponse({ type: UserUpdateResponseDto })
  async updateNotifications(
    @UserId() userId: number,
    @Body() updateData: UserUpdateNotificationsRequestDto
  ): Promise<UserUpdateResponseDto> {
    return this.usersService.updateNotifications({ userId }, updateData);
  }
}
