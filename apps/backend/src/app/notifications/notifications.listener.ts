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
  PurchasePractiseAbortEvent,
  PurchaseBuyPractiseEvent,
  PurchasePractiseAcceptEvent,
  PurchasePractiseDoneEvent,
  ReferralBuyPractiseEvent,
  ReferralReserveSubscriptionByStageEvent,
  ReferralReserveSubscriptionBySubscriptionEvent,
  ReferralBuySubscriptionEvent,
} from '@trinity/shared';
import { NotificationsService } from './notifications.service';
import { UsersService } from '../account';
import { formatDays } from '../service';
import { ContentService } from '../lms';

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly contentService: ContentService
  ) {}

  @OnEvent(ReferralEvents.REGISTERED)
  async onReferralRegistered({
    partnerId,
    referralId,
    level,
  }: ReferralRegisteredEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    const referral = await this.usersService.find({ userId: referralId });

    if (!partner || !referral) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `В вашей структуре появился новый Единомышленник.\n${referral.username ? '@' + referral.username : referral.name}\nПоколение: ${level}.\nСтруктура продолжает расти.`
    );
  }

  @OnEvent(ReferralEvents.BUY)
  async onReferralBuy({ partnerId, level, sum, title, percent }: ReferralBuyEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Ваш Единомышленник в ${level} поколении приобрёл "${title}"\nВы получили +${sum} OM (${percent * 100}%)`
    );
  }

  @OnEvent(ReferralEvents.BUY_PRACTISE)
  async onReferralBuyPractise({
    partnerId,
    level,
    sum,
    title,
    percent
  }: ReferralBuyPractiseEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Ваш Единомышленник в ${level} поколении прошёл практику "${title}"\nВы получили +${sum} OM (${percent * 100}%)`
    );
  }

  @OnEvent(ReferralEvents.BUY_STAGE)
  async onReferralBuyStage({
    partnerId,
    level,
    sum,
    stageLevel,
    stage,
    percent
  }: ReferralBuyStageEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Ваш Единомышленник в ${level} поколении открыл ${stage} Ступень духа ${stageLevel} Уровня\nВы получили +${sum} OM (${percent * 100}%)`
    );
  }

  @OnEvent(ReferralEvents.BUY_SUBSCRIPTION)
  async onReferralBuySubscription({
    partnerId,
    level,
    sum,
    days,
    percent,
  }: ReferralBuySubscriptionEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }
    const daysFormatted =
      days >= 360
        ? '1 год'
        : days == 30
        ? '1 месяц'
        : days + ' ' + formatDays(days);

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Ваш Единомышленник в ${level} поколении активировал доступ к приложению на ${daysFormatted}.
Вы получили +${sum} OM (${percent * 100}%).`
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
вознаграждение отправлено в Резервный Фонд (срок хранения: 33 дня).
Откройте ${stage} Ступень Духа, чтобы вернуть упущенное вознаграждение обратно.`
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
вознаграждение отправлено в Резервный Фонд (срок хранения: 33 дня).
Активируйте доступ к приложению, чтобы вернуть упущенное вознаграждение обратно.`
    );
  }

  @OnEvent(ReferralEvents.RESERVE_BY_STAGE)
  async onReserveByStage({
    partnerId,
    sum,
    title,
    stage,
  }: ReferralReserveByStageEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Вы упустили вознаграждение ${sum} OM за приобретение "${title}"
вознаграждение отправлено в Резервный Фонд (срок хранения: 33 дня).
Откройте ${stage} Ступень Духа, чтобы вернуть упущенное вознаграждение обратно.`
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
вознаграждение отправлено в Резервный Фонд (срок хранения: 33 дня).
Активируйте доступ к приложению, чтобы вернуть упущенное вознаграждение обратно.`
    );
  }

  @OnEvent(ReferralEvents.RESERVE_SUBSCRIPTION_BY_STAGE)
  async onReserveSubscriptionByStage({
    partnerId,
    sum,
    stage,
    level,
    days,
  }: ReferralReserveSubscriptionByStageEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    const daysFormatted =
      days >= 360
        ? '1 год'
        : days == 30
        ? '1 месяц'
        : days + ' ' + formatDays(days);

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Вы упустили вознаграждение ${sum} OM с ${level} поколения за активацию доступа на ${daysFormatted}.
Вознаграждение отправлено в Резервный Фонд (срок хранения: 33 дня).
Откройте ${stage} Ступень Духа, чтобы вернуть упущенное вознаграждение обратно.`
    );
  }

  @OnEvent(ReferralEvents.RESERVE_SUBSCRIPTION_BY_SUBSCRIPTION)
  async onReserveSubscriptionBySubscription({
    partnerId,
    sum,
    days,
    level,
  }: ReferralReserveSubscriptionBySubscriptionEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    const daysFormatted =
      days >= 360
        ? '1 год'
        : days == 30
        ? '1 месяц'
        : days + ' ' + formatDays(days);

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Вы упустили вознаграждение ${sum} OM с ${level} поколения за активацию доступа на ${daysFormatted}.
Вознаграждение отправлено в Резервный Фонд (срок хранения: 33 дня).
Активируйте доступ к приложению, чтобы вернуть упущенное вознаграждение обратно.`
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
      `Внимание: осталось ${days} ${formatDays(days)}, чтобы вернуть ${sum} OM из Резервного Фонда.`
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
Вы открыли необходимую Ступень Духа вовремя.`
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
Вы активировали доступ к приложению вовремя.`
    );
  }

  @OnEvent(SubscriptionEvents.PAYED)
  async onRSubscriptionPayed({ days, subscriptionId }: SubscriptionPayedEvent) {
    const user = await this.usersService.populate({ subscriptionId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Доступ к приложению активирован на ${
        days >= 360 ? '1 год' : `${days} ${formatDays(days as number)}`
      }`
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

    const daysFormatted = formatDays(days);

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Ваш доступ к приложению заканчивается через ${days} ${daysFormatted}`
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

  @OnEvent(PurchaseEvents.BUY_PRACTISE)
  async onPractiseBuy({ userId, trainingId }: PurchaseBuyPractiseEvent) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const training = await this.contentService.findTraining({ trainingId });

    if (!training) {
      throw new NotFoundException('Тренинг не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Вы забронировали практику "${training.title}" за ${training.price} OM.
Позже с вами свяжется эксперт для подтверждения практики
Спасибо, что развиваете ТРИНИТИ.`
    );
  }

  @OnEvent(PurchaseEvents.PRACTISE_ACCEPT)
  async onPractiseAccept({ userId, trainingId }: PurchasePractiseAcceptEvent) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const training = await this.contentService.findTraining({ trainingId });

    if (!training) {
      throw new NotFoundException('Тренинг не найден');
    }

    const merchant = await this.usersService.find({
      userId: training.merchantId,
    });

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Заявку на вашу практику "${training.title}" подтвердил эксперт @${
        merchant?.username ? merchant.username : merchant?.name
      }`
    );
  }

  @OnEvent(PurchaseEvents.PRACTISE_DONE)
  async onPractiseDone({ userId, trainingId }: PurchasePractiseDoneEvent) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const training = await this.contentService.findTraining({ trainingId });

    if (!training) {
      throw new NotFoundException('Тренинг не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Практика "${training.title}" проведена`
    );
  }

  @OnEvent(PurchaseEvents.PRACTISE_ABORT)
  async onPractiseAbort({ userId, trainingId }: PurchasePractiseAbortEvent) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const training = await this.contentService.findTraining({ trainingId });

    if (!training) {
      throw new NotFoundException('Тренинг не найден');
    }

    await this.notificationsService.sendBotMessage(
      user.tgId as number,
      `Практика "${training.title}" отменена`
    );
  }
}
