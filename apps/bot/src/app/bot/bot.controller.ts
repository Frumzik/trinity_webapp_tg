import { Controller, Post, Body } from '@nestjs/common';
import { BotService } from './bot.service';
import { IsInt, IsObject, IsString } from 'class-validator';

class sendMessageDto {
  @IsInt()
  tgId!: number;

  @IsString()
  message!: string;
}

class sendNewPractiseDto {
  @IsObject()
  user: any;

  @IsObject()
  practise: any;
}

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('message')
  async message(@Body() dto: sendMessageDto) {
    await this.botService.sendMessage(dto.tgId, dto.message);
    return { ok: true };
  }

  @Post('practise')
  async practise(@Body() dto: sendNewPractiseDto) {
    await this.botService.sendNewPractiseMessage(dto.user, dto.practise);
    return { ok: true };
  }
}
