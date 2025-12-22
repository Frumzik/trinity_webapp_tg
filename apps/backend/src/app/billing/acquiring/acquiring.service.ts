/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  HttpException,
  Inject,
  forwardRef,
  NotFoundException,
  UseGuards,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import {
  AcquiringDepositEvent,
  AcquiringDepositWebhookDto,
  AcquiringErrorEvent,
  AcquiringErrorWebhookDto,
  AcquiringEvents,
  AcquiringWithdrawEvent,
  AcquiringWithdrawWebhookDto,
  CounterType,
  FundType,
  TransactionType,
  WithdrawType,
} from '@trinity/shared';
import { UserEntity, UsersService } from '../../account';
import { TransactionsService } from '../transactions';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WithdrawsService } from './withdraws.service';
import { Types } from 'mongoose';
import { CountersService, JWTAuthGuard, ProdcutionGuard } from '../../service';
import { FundsService } from '../../referrals';

@UseGuards(JWTAuthGuard, ProdcutionGuard)
@Injectable()
export class AcquiringService {
  private BASE_URL = '';
  private TOKEN = '';
  private withdrawComission = 0.5;
  private moderationLimit = 0;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly withdrawsService: WithdrawsService,
    private readonly countersService: CountersService,
    private readonly fundsService: FundsService
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
  async getAccount(userId: string): Promise<{ address: string }> {
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
  async getWithdrawer(): Promise<{ address: string }> {
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
  async withdraw(userId: number, address: string, amount: string) {
    try {
      const user = await this.usersService.find({ userId });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      let account;

      // Проверяем кошелек
      try {
        account = await this.getAccount(userId.toString());

        if (user.address != account.address) {
          await this.usersService.bindAddress({ userId }, account.address);
        }
      } catch (err: any) {
        // Если кошелька нет — создаём
        if (err?.response?.status === 404) {
          account = await this.createAccount(userId.toString());
          await this.usersService.bindAddress({ userId }, account.address);
        } else {
          throw err;
        }
      }

      const sum = +amount - this.withdrawComission;

      if (user.balance < sum) {
        throw new Error('Недостаточный баланс');
      }

      if (sum <= 0) {
        throw new Error(
          `Вывод не может быть меньше ${this.withdrawComission} ОМ`
        );
      }

      const toUser = await this.usersService.find({ address });

      if (user.address == toUser?.address) {
        throw new Error('Нельзя перевести самому себе');
      }

      if (toUser) {
        await this.withdrawToUser(user, toUser, +amount);
      } else {
        await this.withrawToAddress(user, address, sum);
      }

      return { created: true };
    } catch (error: any) {
      throw this.wrapError(error);
    }
  }

  private async withdrawToUser(
    user: UserEntity,
    toUser: UserEntity,
    amount: number
  ) {
    await this.transactionsService.create({
      type: TransactionType.WITHDRAWAL,
      userId: user.userId,
      sum: -amount,
      description: `Перевод ${amount} ОМ другому пользователю`,
    });

    await this.transactionsService.create({
      type: TransactionType.REPLENISHMENT,
      userId: toUser.userId,
      sum: amount,
      description: `Пополнение ${amount} ОМ от другого пользователя`,
    });

    await this.usersService.decBalance(
      { userId: user.userId },
      { dec: amount }
    );
    await this.usersService.incBalance(
      { userId: toUser.userId },
      { inc: amount }
    );

    await this.eventEmitter.emit(
      AcquiringEvents.WITHDRAW,
      new AcquiringWithdrawEvent(user.userId, amount)
    );

    await this.eventEmitter.emit(
      AcquiringEvents.DEPOSIT,
      new AcquiringDepositEvent(toUser.userId, amount)
    );
  }

  private async withrawToAddress(
    user: UserEntity,
    address: string,
    sum: number
  ) {
    const existWithdraw = await this.withdrawsService.find({
      toAddress: address,
    });

    if (existWithdraw) {
      throw new Error('Дождитесь выполнения предыдущей заявки');
    }

    const needModeration = sum >= this.moderationLimit;

    const withdrawId = await this.countersService.saveNextSequence(
      CounterType.WITHDRAW_ID
    );

    await this.withdrawsService.create({
      withdrawId,
      type: WithdrawType.USER,
      userId: user.userId,
      amount: sum,
      toAddress: address.toLowerCase(),
      user: user._id as Types.ObjectId,
      needModeration,
    });

    if (!needModeration) {
      try {
        await this.sendWithdrawRequest(address, sum);
      } catch (e) {
        await this.withdrawsService.delete;
      }
    }
  }

  async fundWithdraw(
    userId: number,
    fundType: FundType,
    address: string,
    amount: number
  ) {
    const fund = await this.fundsService.find({ type: fundType });

    if (!fund) {
      console.log('Фонд не найден');
      throw new NotFoundException('Фонд не найден');
    }

    if (fund.balance < amount) {
      console.log('Недостаточный баланс');
      throw new Error('Недостаточный баланс');
    }

    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const withdrawId = await this.countersService.saveNextSequence(
      CounterType.WITHDRAW_ID
    );
    await this.withdrawsService.create({
      withdrawId,
      type: WithdrawType.FUND,
      user: user._id,
      userId,
      fundType,
      amount,
      toAddress: address.toLowerCase(),
      needModeration: false,
    });

    try {
      await this.sendWithdrawRequest(address, amount);
    } catch (e) {
      await this.withdrawsService.delete({ withdrawId });
    }
  }

  async sendWithdrawRequest(address: string, amount: number) {
    try {
      await firstValueFrom(
        this.http.post(
          `${this.BASE_URL}/withdraw`,
          { address, amount: amount.toString() },
          { headers: this.headers }
        )
      );
    } catch (error: unknown) {
      Logger.log(error);

      throw new InternalServerErrorException(
        'Ошибка при создании заявки на вывод',
        error as string
      );
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
      { inc: +body.amount }
    );
    await this.transactionsService.create({
      userId: +body.toUserId,
      type: TransactionType.REPLENISHMENT,
      sum: +body.amount,
      description: `${+body.amount} ОМ добавлено на баланс`,
    });

    await this.eventEmitter.emit(
      AcquiringEvents.DEPOSIT,
      new AcquiringDepositEvent(+body.toUserId, +body.amount)
    );

    return { ok: true };
  }

  async handleWithdraw(body: AcquiringWithdrawWebhookDto) {
    const withdraw = await this.withdrawsService.find({
      toAddress: body.toAddress.toLowerCase(),
      // amount: body.amount,
    });

    if (!withdraw) {
      return { ok: false };
    }

    if (withdraw.type == WithdrawType.USER) {
      const user = await this.usersService.find({ userId: withdraw.userId });

      if (!user) {
        return { ok: false };
      }

      const sum = body.amount + this.withdrawComission;

      await this.usersService.decBalance({ userId: user.userId }, { dec: sum });
      await this.transactionsService.create({
        userId: +user.userId,
        type: TransactionType.WITHDRAWAL,
        sum: -sum,
        description: `${sum} ОМ выведено`,
        toAddress: body.toAddress,
      });

      await this.fundsService.incAdmin(this.withdrawComission);
      await this.transactionsService.create({
        userId: +user.userId,
        type: TransactionType.FUND,
        sum: this.withdrawComission,
        fundType: FundType.ADMIN,
        description: `Комиссия с вывода`,
      });

      await this.eventEmitter.emit(
        AcquiringEvents.WITHDRAW,
        new AcquiringDepositEvent(+user.userId, +body.amount)
      );
    } else if (withdraw.type == WithdrawType.FUND) {
      if (withdraw.fundType == FundType.MAIN) {
        await this.fundsService.decMain(withdraw.amount);
      } else if (withdraw.fundType == FundType.ADMIN) {
        await this.fundsService.decAdmin(withdraw.amount);
      }

      const fund = await this.fundsService.find({ type: FundType.ADMIN });

      await this.transactionsService.create({
        userId: withdraw.userId as number,
        type: TransactionType.FUND,
        sum: -withdraw.amount,
        description: `Вывод из "${fund?.title}"`,
        toAddress: body.toAddress,
      });
    }

    await this.withdrawsService.delete({ _id: withdraw._id });

    return { ok: true };
  }

  async handleInsufficientBalance(body: AcquiringErrorWebhookDto) {
    await this.eventEmitter.emit(
      AcquiringEvents.ERROR,
      new AcquiringErrorEvent(body.message)
    );

    console.log('Insufficient balance webhook received:', body);
    return { ok: true };
  }

  async handleRuntimeError(body: AcquiringErrorWebhookDto) {
    await this.eventEmitter.emit(
      AcquiringEvents.ERROR,
      new AcquiringErrorEvent(body.message)
    );

    console.log('Runtime error webhook received:', body);
    return { ok: true };
  }
}
