import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ReferralBuyStageEvent,
  ReferralRegisteredEvent,
  ReferralEvents,
  SubscriptionDaysLeftEvent,
  SubscriptionEvents,
  SubscriptionExpiredEvent,
  SubscriptionPayedEvent,
  ReferralBuyEvent,
  ReferralReserveExpiredEvent,
  ReferralReserveDaysLeftEvent,
  ReferralReserveStageReturnedEvent,
  ReferralReserveSubscriptionReturnedEvent,
  ReferralReserveStageBySubscriptionEvent,
  ReferralReserveStageByStageEvent,
  ReferralReserveByStageEvent,
  ReferralReserveBySubscriptionEvent,
  PurchaseEvents,
  PurchaseBuyEvent,
  PurchaseBuyStageEvent,
  AcquiringEvents,
  AcquiringDepositEvent,
  AcquiringWithdrawEvent,
  AcquiringErrorEvent,
} from '@trinity/shared';
import { NotificationsService } from './notifications.service';
import { UsersService } from '../account';

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService
  ) {}

  @OnEvent(ReferralEvents.REGISTERED)
  async onReferralRegistered({ partnerId, level }: ReferralRegisteredEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `В вашей структуре появился новый единомышленник.\nПоколение: ${level}.\nСтруктура продолжает расти.`
    );
  }

  @OnEvent(ReferralEvents.BUY)
  async onReferralBuy({ partnerId, level, sum, title }: ReferralBuyEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Ваш единомышленник в ${level} поколении приобрёл "${title}"\nВы получили +${sum} OM`
    );
  }

  @OnEvent(ReferralEvents.BUY_STAGE)
  async onReferralBuyStage({
    partnerId,
    level,
    sum,
    stageLevel,
    stage,
  }: ReferralBuyStageEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Ваш единомышленник в ${level} поколении открыл ${stage} Ступень духа ${stageLevel} Уровня\nВы получили +${sum} OM`
    );
  }

  @OnEvent(ReferralEvents.RESERVE_STAGE_BY_STAGE)
  async onReserveStageByStage({
    partnerId,
    level,
    sum,
    stageLevel,
    stage,
  }: ReferralReserveStageByStageEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Вы упустили вознаграждение ${sum} OM с ${level} поколения за открытие ${stage} Ступени духа ${stageLevel} Уровня
Причина: не открыта ${stageLevel}-${stage} Ступень Духа
Вознаградение отправлено в Резервный Фонд (срок хранения: 33 дня).
Откройте Ступень Духа, чтобы вернуть упущенное вознаграждение обратно.`
    );
  }

  @OnEvent(ReferralEvents.RESERVE_STAGE_BY_SUBSCRIPTION)
  async onReserveStageBySubscription({
    partnerId,
    level,
    sum,
    stageLevel,
    stage,
  }: ReferralReserveStageBySubscriptionEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Вы упустили вознаграждение ${sum} OM с ${level} поколения за открытие ${stage} Ступени духа ${stageLevel} Уровня
Причина: доступ к приложению не активирован
Вознаградение отправлено в Резервный Фонд (срок хранения: 33 дня).
Активируйте доступ, чтобы вернуть упущенное вознаграждение обратно.`
    );
  }

  @OnEvent(ReferralEvents.RESERVE_BY_STAGE)
  async onReserveByStage({
    partnerId,
    sum,
    title,
    stageLevel,
    stage,
  }: ReferralReserveByStageEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Вы упустили вознаграждение ${sum} OM за приобретение "${title}"
Причина: не открыта ${stage} Ступень духа ${stageLevel} Уровня
Вознаградение отправлено в Резервный Фонд (срок хранения: 33 дня).
Откройте Ступень Духа, чтобы вернуть упущенное вознаграждение обратно.`
    );
  }

  @OnEvent(ReferralEvents.RESERVE_BY_SUBSCRIPTION)
  async onReserveBySubscription({
    partnerId,
    sum,
    title,
  }: ReferralReserveBySubscriptionEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Вы упустили вознаграждение ${sum} OM за приобретение "${title}"
Причина: доступ к приложению не активирован
Вознаградение отправлено в Резервный Фонд (срок хранения: 33 дня).
Откройте Активируйте доступ, чтобы вернуть упущенное вознаграждение обратно.`
    );
  }

  @OnEvent(ReferralEvents.RESERVE_DAYS_LEFT)
  async onReferralReserveDaysLeft({
    userId,
    sum,
    days,
  }: ReferralReserveDaysLeftEvent) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Внимание: осталось ${days} дня, чтобы вернуть ${sum} OM из Резервного Фонда.`
    );
  }

  @OnEvent(ReferralEvents.RESERVE_EXPIRED)
  async onReferralExpired({ userId, sum }: ReferralReserveExpiredEvent) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Срок хранения упущенного вознаграждения истёк.
${sum} OM отправлены в Фонд Света`
    );
  }

  @OnEvent(ReferralEvents.RESERVE_STAGE_RETURNED)
  async onReferralStageReturned({
    userId,
    sum,
  }: ReferralReserveStageReturnedEvent) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Вознаграждение ${sum} OM возвращено вам из Резервного Фонда.
Вы открыли необходимую ступень`
    );
  }

  @OnEvent(ReferralEvents.RESERVE_SUBSCRIPTION_RETURNED)
  async onReferralSubscriptionReturned({
    userId,
    sum,
  }: ReferralReserveSubscriptionReturnedEvent) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Вознаграждение ${sum} OM возвращено вам из Резервного Фонда.
Вы активировали доступ вовремя`
    );
  }

  @OnEvent(SubscriptionEvents.PAYED)
  async onRSubscriptionPayed({ subscriptionId }: SubscriptionPayedEvent) {
    const user = await this.usersService.find({ subscriptionId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Доступ к приложению активирован.`
    );
  }

  @OnEvent(SubscriptionEvents.DAYS_LEFT)
  async onSubscriptionDaysLeft({
    subscriptionId,
    days,
  }: SubscriptionDaysLeftEvent) {
    const user = await this.usersService.find({ subscriptionId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Ваш доступ к приложению заканчивается через ${days} дня`
    );
  }

  @OnEvent(SubscriptionEvents.EXPIRED)
  async onSubscriptionExpired({ subscriptionId }: SubscriptionExpiredEvent) {
    const user = await this.usersService.find({ subscriptionId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Доступ к приложению не активен.
Все вознаграждения будут уходить в Резервный Фонд и храниться там 33 дня до момента активации доступа.`
    );
  }

  @OnEvent(PurchaseEvents.BUY)
  async onPurchaseBuy({ userId, sum, title }: PurchaseBuyEvent) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Вы приобрели товар/услугу "${title}" за ${sum} OM.
Спасибо, что развиваете ТРИНИТИ.`
    );
  }

  @OnEvent(PurchaseEvents.BUY_STAGE)
  async onPurchaseBuyStage({
    userId,
    stage,
    stageLevel,
  }: PurchaseBuyStageEvent) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Поздравляем! Вы открыли ${stage} Ступень Духа ${stageLevel} уровня`
    );
  }

  @OnEvent(AcquiringEvents.DEPOSIT)
  async onAcquringDeposit({ userId, sum }: AcquiringDepositEvent) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Баланс пополнен на ${sum} ОМ`
    );
  }

  @OnEvent(AcquiringEvents.WITHDRAW)
  async onAcquringWithdraw({ userId, sum }: AcquiringWithdrawEvent) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Выведено ${sum} ОМ`
    );
  }

  @OnEvent(AcquiringEvents.ERROR)
  async onAcquringError({ message }: AcquiringErrorEvent) {
    await this.notificationsService.sendBotError(message);
  }
}
