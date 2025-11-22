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
        url: 'https://s3.twcstorage.ru/13217ac8-a7451518-6949-46ca-ba80-d0cde001160c/prod/1763442729467-%C3%90%C2%A2%C3%90%C2%A0%C3%90%C2%98%C3%90%C2%9D%C3%90%C2%98%C3%90%C2%A2%C3%90%C2%98.pdf',
        filename: 'ТРИНИТИ.pdf',
      });
    } catch (error) {
      console.error('Failed to send presentation:', error);
      return ctx.reply('Не удалось отправить презентацию 😔');
    }
  }

  async sendMessage(tgId: number, message: string) {
    return this.bot.telegram.sendMessage(tgId, message);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendNewPractiseMessage(user: any, practise: any) {
    return this.bot.telegram.sendMessage(
      this.configService.get('BOT_ADMIN_CHAT') || 0,
      `Новая покупка практики:\n\nПрактика: ${practise.title}\nПользователь: ${user.name} - ${user.username}`
    );
  }

  async sendErrorMessage(message: string) {
    return this.bot.telegram.sendMessage(
      this.configService.get('BOT_ERRORS_CHAT') || 0,
      `Ошибка: ${message}`
    );
  }
}
