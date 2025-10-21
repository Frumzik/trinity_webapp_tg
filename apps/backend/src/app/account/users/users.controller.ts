import { Body, Controller, Get, NotFoundException, Patch, UseGuards } from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../../service';
import { UsersService } from './users.service';
import {
  IUser,
  UserUpdateProfileRequestDto,
  UserUpdateRoleRequestDto,
} from '@trinity/shared';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('info')
  @UseGuards(JWTAuthGuard)
  async info(@UserId() userId: number): Promise<IUser> {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  @Get('info/populate')
  @UseGuards(JWTAuthGuard)
  async infoPopulate(@UserId() userId: number): Promise<IUser> {
    const user = await this.usersService.populate({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  @Patch('update-profile')
  @UseGuards(JWTAuthGuard)
  async updateProfile(
    @UserId() userId: number,
    @Body() updateData: UserUpdateProfileRequestDto
  ): Promise<IUser> {
    const user = await this.usersService.updateProfile({ userId }, updateData);

    return user;
  }

  @Patch('update-role')
  @UseGuards(JWTAuthGuard)
  async updateRole(
    @UserId() userId: number,
    @Body() updateData: UserUpdateRoleRequestDto
  ): Promise<IUser> {
    const user = await this.usersService.updateRole({ userId }, updateData);

    return user;
  }
}
