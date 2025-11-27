import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { IsInt } from 'class-validator';

class SendPresentationDto {
  @IsInt()
  @ApiProperty()
  tgId!: number;
}
@Controller('notifications')
@ApiTags('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  @Post('presentation')
  @ApiOperation({ summary: 'Отправить презентацию' })
  async sendPresentation(@Body() dto: SendPresentationDto) {
    return await this.notificationsService.sendBotPresentation(dto.tgId);
  }
}
