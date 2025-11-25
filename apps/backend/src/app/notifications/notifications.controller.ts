import {
  Controller,
  forwardRef,
  Inject,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { UsersService } from '../account';

@Controller('notifications')
@UseGuards(JWTAuthGuard)
@ApiTags('notifications')
@ApiBearerAuth('access_token')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService
  ) {}
  @Post('presentation')
  @ApiOperation({ summary: 'Отправить презентацию' })
  async sendPresentation(@UserId() userId: number) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return await this.notificationsService.sendBotPresentation(
      user.tgId as number
    );
  }
}
