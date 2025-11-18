import { Injectable, HttpException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class NotificationsService {
  private BOT_URL: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {

    this.BOT_URL = this.configService.get<string>('BOT_URL') || 'http://localhost:3001';
  }

  async sendBotMessage(tgId: number, message: string) {
    try {
      const res = await firstValueFrom(
        this.http.post(`${this.BOT_URL}/bot/message`, {
          tgId,
          message,
        }),
      );

      return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new HttpException(
        {
          status: error.response?.status || 500,
          reason: error.response?.data || error.message,
        },
        error.response?.status || 500,
      );
    }
  }
}
