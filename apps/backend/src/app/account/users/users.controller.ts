import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../../service';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('info')
  @UseGuards(JWTAuthGuard)
  async info(@UserId() userId: number): Promise<UserEntity> {
    return await this.usersService.findUser({ userId });
  }

  @Patch('update')
  @UseGuards(JWTAuthGuard)
  async update(
    @UserId() userId: number,
    @Body() updateData: Partial<UserEntity>
  ): Promise<UserEntity> {
    return await this.usersService.updateUser({ userId }, updateData);
  }
}
