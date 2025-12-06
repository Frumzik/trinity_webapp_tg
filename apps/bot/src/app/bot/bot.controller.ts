import { Controller, Post, Body } from '@nestjs/common';
import { BotService } from './bot.service';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

class sendMessageDto {
  @IsInt()
  tgId!: number;

  @IsString()
  message!: string;

  @IsBoolean()
  @IsOptional()
  isHtml?: boolean;
}

class sendNewPractiseDto {
  @IsObject()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;

  @IsObject()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  practise: any;
}

class sendErrorDto {
  @IsString()
  message!: string;
}

class sendPresentationDto {
  @IsInt()
  tgId!: number;
}

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('message')
  async message(@Body() dto: sendMessageDto) {
    if (dto.isHtml === true) {
      await this.botService.sendHtmlMessage(dto.tgId, dto.message);
    } else {
      await this.botService.sendMessage(dto.tgId, dto.message);
    }

    return { ok: true };
  }

  @Post('practise')
  async practise(@Body() dto: sendNewPractiseDto) {
    await this.botService.sendNewPractiseMessage(dto.user, dto.practise);
    return { ok: true };
  }

  @Post('error')
  async error(@Body() dto: sendErrorDto) {
    await this.botService.sendErrorMessage(dto.message);
    return { ok: true };
  }

  @Post('presentation')
  async presentation(@Body() dto: sendPresentationDto) {
    await this.botService.sendPresentation(dto.tgId);
    return { ok: true };
  }
}
