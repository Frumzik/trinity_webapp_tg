import { Controller, Get, UseGuards } from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../../service';

@Controller('user')
export class UsersController {
  @Get('info')
  @UseGuards(JWTAuthGuard)
  async info(@UserId() userId: string) {
    return userId;
  }
}
