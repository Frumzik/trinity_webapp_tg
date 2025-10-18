import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../../service';
import { UsersService } from './users.service';
import { IUser, UserUpdateProfileRequestDto, UserUpdateRoleRequestDto } from '@trinity/shared';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('info')
  @UseGuards(JWTAuthGuard)
  async info(@UserId() userId: number): Promise<IUser> {
    const user = await this.usersService.findUser({ userId });

    return user;
  }

  @Get('info-all')
  @UseGuards(JWTAuthGuard)
  async infoAll(@UserId() userId: number): Promise<IUser> {
    const user = await this.usersService.findUserAll({ userId });

    return user;
  }

  @Patch('update-profile')
  @UseGuards(JWTAuthGuard)
  async updateProfile(
    @UserId() userId: number,
    @Body() updateData: UserUpdateProfileRequestDto
  ): Promise<IUser> {
    const user = await this.usersService.updateUserProfile(
      { userId },
      updateData
    );

    return user;
  }

  @Patch('update-role')
  @UseGuards(JWTAuthGuard)
  async updateRole(
    @UserId() userId: number,
    @Body() updateData: UserUpdateRoleRequestDto
  ): Promise<IUser> {
    const user = await this.usersService.updateUserRole({ userId }, updateData);

    return user;
  }
}
