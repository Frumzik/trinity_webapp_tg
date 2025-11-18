import { Controller, Post, Body } from '@nestjs/common';
import { BotService } from './bot.service';
import { IsInt, IsString } from 'class-validator';

class sendMessageDto {
  @IsInt()
  tgId!: number;

  @IsString()
  message!: string;
}

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('message')
  async message(@Body() dto: sendMessageDto) {
    await this.botService.sendMessage(dto.tgId, dto.message);
    return { ok: true };
  }
}
