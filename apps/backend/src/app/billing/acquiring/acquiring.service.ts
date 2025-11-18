/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  HttpException,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import {
  AcquiringDepositWebhookDto,
  AcquiringErrorWebhookDto,
  AcquiringWithdrawWebhookDto,
  TransactionType,
} from '@trinity/shared';
import { UsersService } from '../../account';
import { TransactionsService } from '../transactions';

@Injectable()
export class AcquiringService {
  private BASE_URL = '';
  private TOKEN = '';

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService
  ) {
    this.BASE_URL = this.configService.get('ACQUIRING_URL') || '';
    this.TOKEN = this.configService.get('ACQUIRING_TOKEN') || '';
  }

  // -------------------------
  // ВСПОМОГАТЕЛЬНЫЙ МЕТОД ДЛЯ ЗАГОЛОВКОВ
  // -------------------------
  private get headers() {
    return {
      'access-token': this.TOKEN,
    };
  }

  // -------------------------
  // 1. Создание аккаунта
  // -------------------------
  async createAccount(userId: string) {
    try {
      const res = await firstValueFrom(
        this.http.post(
          `${this.BASE_URL}/account`,
          { userId },
          { headers: this.headers }
        )
      );

      return res.data;
    } catch (error: any) {
      throw this.wrapError(error);
    }
  }

  // -------------------------
  // 2. Получение аккаунта
  // -------------------------
  async getAccount(userId: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.BASE_URL}/account/${userId}`, {
          headers: this.headers,
        })
      );

      return res.data;
    } catch (error: any) {
      throw this.wrapError(error);
    }
  }

  // -------------------------
  // 3. Получение Withdrawer
  // -------------------------
  async getWithdrawer() {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.BASE_URL}/account/withdrawer`, {
          headers: this.headers,
        })
      );

      return res.data;
    } catch (error: any) {
      throw this.wrapError(error);
    }
  }

  // -------------------------
  // 4. Получение Depositor
  // -------------------------
  async getDepositor() {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.BASE_URL}/account/depositor`, {
          headers: this.headers,
        })
      );

      return res.data;
    } catch (error: any) {
      throw this.wrapError(error);
    }
  }

  // -------------------------
  // 5. Обновление withdrawer
  // -------------------------
  async updateWithdrawer(privateKey: string) {
    try {
      await firstValueFrom(
        this.http.put(
          `${this.BASE_URL}/account/withdrawer`,
          { privateKey },
          { headers: this.headers }
        )
      );

      return { success: true };
    } catch (error: any) {
      throw this.wrapError(error);
    }
  }

  // -------------------------
  // 6. Обновление depositor
  // -------------------------
  async updateDepositor(privateKey: string) {
    try {
      await firstValueFrom(
        this.http.put(
          `${this.BASE_URL}/account/depositor`,
          { privateKey },
          { headers: this.headers }
        )
      );

      return { success: true };
    } catch (error: any) {
      throw this.wrapError(error);
    }
  }

  // -------------------------
  // 7. Вывод средств
  // -------------------------
  async withdraw(address: string, amount: string) {
    try {
      await firstValueFrom(
        this.http.post(
          `${this.BASE_URL}/withdraw`,
          { address, amount },
          { headers: this.headers }
        )
      );

      return { created: true };
    } catch (error: any) {
      throw this.wrapError(error);
    }
  }

  // -------------------------
  // Универсальный обработчик ошибок
  // -------------------------
  private wrapError(error: any): HttpException {
    if (error.response) {
      return new HttpException(
        {
          status: error.response.status,
          reason: error.response.data?.reason ?? 'Unknown error',
          data: error.response.data,
        },
        error.response.status
      );
    }

    if (error.request) {
      return new HttpException(
        { message: 'External API did not respond' },
        504
      );
    }

    return new HttpException(
      { message: 'Unexpected error', detail: error.message },
      500
    );
  }

  async handleDeposit(body: AcquiringDepositWebhookDto) {
    await this.usersService.incBalance(
      { userId: +body.toUserId },
      { inc: body.amount }
    );
    await this.transactionsService.create({
      userId: +body.toUserId,
      type: TransactionType.REPLENISHMENT,
      sum: body.amount,
      description: 'Пополнение счёта',
    });

    return { ok: true };
  }

  async handleWithdraw(body: AcquiringWithdrawWebhookDto) {
    const user = await this.usersService.find({ address: body.fromAddress });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.usersService.decBalance(
      { userId: user.userId },
      { dec: body.amount }
    );
    await this.transactionsService.create({
      userId: +user.userId,
      type: TransactionType.WITHDRAWAL,
      sum: body.amount,
      description: 'Вывод средств',
    });

    return { ok: true };
  }

  async handleInsufficientBalance(body: AcquiringErrorWebhookDto) {
    console.log('Insufficient balance webhook received:', body);
    return { ok: true };
  }

  async handleRuntimeError(body: AcquiringErrorWebhookDto) {
    console.log('Runtime error webhook received:', body);
    return { ok: true };
  }
}
