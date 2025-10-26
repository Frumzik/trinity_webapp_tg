import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../../service';
import { UsersService } from './users.service';
import {
  UserBalanceDecRequestDto,
  UserBalanceIncRequestDto,
  UserInfoResponseDto,
  UserUpdateEmailRequestDto,
  UserUpdatePasswordRequestDto,
  UserUpdatePinRequestDto,
  UserUpdateProfileRequestDto,
  UserUpdateResponseDto,
  UserUpdateRoleRequestDto,
} from '@trinity/shared';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JWTAuthGuard)
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
  @UseGuards(JWTAuthGuard)
  async updateProfile(
    @UserId() userId: number,
    @Body() updateData: UserUpdateProfileRequestDto
  ): Promise<UserUpdateResponseDto> {
    const user = await this.usersService.updateProfile({ userId }, updateData);

    return user;
  }

  @Post('update/role')
  @UseGuards(JWTAuthGuard)
  async updateRole(
    @UserId() userId: number,
    @Body() updateData: UserUpdateRoleRequestDto
  ): Promise<UserUpdateResponseDto> {
    const user = await this.usersService.updateRole({ userId }, updateData);

    return user;
  }

  @Post('update/pin')
  @UseGuards(JWTAuthGuard)
  async updatePin(
    @UserId() userId: number,
    @Body() updateData: UserUpdatePinRequestDto
  ): Promise<UserUpdateResponseDto> {
    const user = await this.usersService.updatePin({ userId }, updateData);

    return user;
  }

  @Post('update/password')
  @UseGuards(JWTAuthGuard)
  async updatePassword(
    @UserId() userId: number,
    @Body() updateData: UserUpdatePasswordRequestDto
  ): Promise<UserUpdateResponseDto> {
    const user = await this.usersService.updatePassword({ userId }, updateData);

    return user;
  }

  @Post('update/email')
  @UseGuards(JWTAuthGuard)
  async updateEmail(
    @UserId() userId: number,
    @Body() updateData: UserUpdateEmailRequestDto
  ): Promise<UserUpdateResponseDto> {
    const user = await this.usersService.updateEmail({ userId }, updateData);

    return user;
  }

  @Post('/balance/inc')
  @UseGuards(JWTAuthGuard)
  async incBalance(
    @UserId() userId: number,
    @Body() updateData: UserBalanceIncRequestDto
  ): Promise<UserUpdateResponseDto> {
    const user = await this.usersService.incBalance({ userId }, updateData);

    return user;
  }

  @Post('/balance/dec')
  @UseGuards(JWTAuthGuard)
  async decBalance(
    @UserId() userId: number,
    @Body() updateData: UserBalanceDecRequestDto
  ): Promise<UserUpdateResponseDto> {
    const user = await this.usersService.decBalance({ userId }, updateData);

    return user;
  }
}
