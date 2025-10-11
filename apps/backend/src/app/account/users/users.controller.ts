import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../../service';
import { UsersService } from './users.service';
import {
  UserInfoResponseDto,
  UserUpdateProfileRequestDto,
} from '@trinity/shared';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('info')
  @UseGuards(JWTAuthGuard)
  async info(@UserId() userId: number): Promise<UserInfoResponseDto> {
    const user = await this.usersService.findUser({ userId });

    return {
      userId: user.userId,
      name: user.name,
      username: user.username,
      tgId: user.tgId,
      email: user.email,
      role: user.role,
      balance: user.balance,
    };
  }

  @Patch('update-profile')
  @UseGuards(JWTAuthGuard)
  async update(
    @UserId() userId: number,
    @Body() updateData: UserUpdateProfileRequestDto
  ): Promise<UserInfoResponseDto> {
    const user = await this.usersService.updateUserProfile(
      { userId },
      updateData
    );

    return {
      userId: user.userId,
      name: user.name,
      username: user.username,
      tgId: user.tgId,
      email: user.email,
      role: user.role,
      balance: user.balance,
    };
  }
}
