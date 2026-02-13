import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import axios from 'axios';

@Injectable()
export class BotService implements OnModuleInit {
  private bot!: Telegraf;
  private API_URL!: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.bot = new Telegraf(this.configService.get('BOT_TOKEN') || '');
    this.API_URL = this.configService.get('API_URL') || 'http://localhost:3000';

    // /start командa с deep-link аргументом
    this.bot.start(async (ctx) => {
      const message = ctx.message.text;
      const tgId = ctx.from.id;
      const username = ctx.from.username;
      const name = ctx.from.first_name;

      // Проверяем наличие параметра после /start
      const params = message.split(' ');

      await this.sendWelcomeMessage(ctx);

      if (params.length > 1) {
        try {
          const checkResponse = await axios.get(
            `${this.API_URL}/auth/check-tg?id=${tgId}`
          );

          if (!checkResponse.data.data) {
            const partnerId = +params[1]; // Любой параметр после /start

            // Генерируем 4-значный PIN
            const pin = Math.floor(1000 + Math.random() * 9000).toString();

            // Отправляем POST запрос на регистрацию
            const response = await axios.post(`${this.API_URL}/auth/register`, {
              type: 'TG',
              tgId,
              pin,
              partnerId,
              username,
              name,
            });

            if (response.status === 201 || response.status === 200) {
              // Регистрация успешна - отправляем PIN
              await ctx.reply(
                `🔐 Ваш PIN-код для доступа: <code>${pin}</code>`,
                {
                  parse_mode: 'HTML',
                }
              );
            } else {
              throw new Error(`Ошибка регистрации: ${response.statusText}`);
            }
          }
        } catch (error) {
          console.error('Registration error:', error);

          // В случае ошибки регистрации, отправляем стандартное приветствие
          await this.sendWelcomeMessage(ctx);

          // Отправляем сообщение об ошибке пользователю
          await ctx.reply(
            '⚠️ <strong>Произошла ошибка при регистрации</strong>\n\nПожалуйста, попробуйте позже или обратитесь в поддержку.',
            { parse_mode: 'HTML' }
          );
        }
      }
    });
    this.bot.help((ctx) => ctx.reply('Список команд...'));

    this.bot.launch();
    console.log('Telegram bot launched');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendWelcomeMessage(ctx: any) {
    return await ctx.reply(
      `<b>✨ Добро пожаловать в Пространство ТРИНИТИ 💟</b>

Ваша трансформация начинается прямо сейчас. 🧬

<b>📲 Как войти в приложение:</b>
Нажмите большую кнопку <b>«ОТКРЫТЬ»</b> в левом нижнем углу данного чата. ↙️

<b>📖 С чего начать:</b>
Первый и самый важный шаг — откройте Полное Руководство Пространства. Это ваш надежный путеводитель, который поможет легко и уверенно войти в процесс: <a href="https://teletype.in/@trinity_light/trinity_guide">https://teletype.in/@trinity_light/trinity_guide</a>

Чтобы быть в потоке всех событий и возможностей, присоединяйтесь к нашим официальным ресурсам:

<b>📢 Информационный Канал:</b> <a href="https://t.me/trinity_channel">t.me/trinity_channel</a>

<b>💭 Чат Сообщества:</b> <a href="https://t.me/trinity_space">t.me/trinity_space</a>

<b>💞 Канал Откликов:</b> <a href="https://t.me/trinity_hearts">t.me/trinity_hearts</a>

Если появятся вопросы — мы всегда рядом и готовы помочь.
<b>🫶🏼 Помощь и Поддержка:</b> <a href="https://t.me/trinity_light">t.me/trinity_light</a>

<i>🙏🏼 Благодарим за доверие и выбор Пути вместе с ТРИНИТИ 💜</i>`,
      {
        parse_mode: 'HTML',
      }
    );
  }

  async sendPresentation(tgId: number) {
    return await this.sendDocument(
      tgId,
      'https://s3.twcstorage.ru/13217ac8-a7451518-6949-46ca-ba80-d0cde001160c/prod/1767144018927-TRINITI-1-.pdf',
      'ТРИНИТИ.pdf'
    );
  }

  async sendDocument(tgId: number, url: string, filename: string) {
    try {
      return await this.bot.telegram.sendDocument(tgId, {
        url,
        filename,
      });
    } catch (error) {
      console.error('Failed to send presentation:', error);
      return this.bot.telegram.sendMessage(
        tgId,
        'Не удалось отправить файл 😔'
      );
    }
  }

  async sendMessage(tgId: number, message: string) {
    return this.bot.telegram.sendMessage(tgId, message);
  }

  async sendHtmlMessage(tgId: number, message: string) {
    return this.bot.telegram.sendMessage(tgId, message, {
      parse_mode: 'HTML',
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendNewPractiseMessage(user: any, practise: any) {
    return this.bot.telegram.sendMessage(
      this.configService.get('BOT_ADMIN_CHAT') || 0,
      `Новая покупка практики:\n\nПрактика: ${practise.title}\nПользователь: ${user.name} - @${user.username}`
    );
  }

  async sendErrorMessage(message: string) {
    return this.bot.telegram.sendMessage(
      this.configService.get('BOT_ERRORS_CHAT') || 0,
      `Ошибка: ${message}`
    );
  }
}
