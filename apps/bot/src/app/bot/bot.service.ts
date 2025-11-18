import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class BotService implements OnModuleInit {
  private bot!: Telegraf;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.bot = new Telegraf(this.configService.get('BOT_TOKEN') || '');

    // /start командa с deep-link аргументом
    this.bot.start(async (ctx) => {
      const payload = ctx.startPayload; // ← аргумент после "start="

      if (payload === 'presentation') {
        return this.sendPresentation(ctx);
      }

      return ctx.reply('Добро пожаловать!');
    });
    this.bot.help((ctx) => ctx.reply('Список команд...'));
    this.bot.command('ping', (ctx) => ctx.reply('pong'));

    this.bot.launch();
    console.log('Telegram bot launched');
  }

  private async sendPresentation(ctx: Context) {
    try {
      await ctx.reply('Отправляю презентацию...');

      return await ctx.replyWithDocument({
        source: 'files/presentation.pdf', // положи файл в папку /files
        filename: 'Trinity_Presentation.pdf',
      });
    } catch (error) {
      console.error('Failed to send presentation:', error);
      return ctx.reply('Не удалось отправить презентацию 😔');
    }
  }

  async sendMessage(tgId: number, message: string) {
    return this.bot.telegram.sendMessage(tgId, message);
  }
}
