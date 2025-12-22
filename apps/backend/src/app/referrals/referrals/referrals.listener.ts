// learning.listener.ts
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  PurchaseCreatedEvent,
  PurchaseEvents,
  PurchaseType,
  ReferralBuyEvent,
  ReferralBuyStageEvent,
  ReferralReserveStageByStageEvent,
  ReferralEvents,
  ReserveFundItemType,
  TransactionType,
  ReferralReserveStageBySubscriptionEvent,
  PurchasePractiseAbortEvent,
  PurchasePractiseDoneEvent,
  ReferralReserveByStageEvent,
  ReferralReserveBySubscriptionEvent,
  ReferralBuyPractiseEvent,
  FundType,
} from '@trinity/shared';
import {
  PurchaseEntity,
  PurchaseService,
  SubscriptionsService,
  TransactionEntity,
  TransactionsService,
} from '../../billing';
import { ContentService } from '../../lms';
import { ReferralsService } from './referrals.service';
import { UsersService } from '../../account';
import { FundsService } from '../funds';
import { TrainingEntity } from '../../lms/content/entities';
import { formatDays } from '../../service';

@Injectable()
export class ReferralsListener {
  private levelPercents = {
    1: 0.36,
    2: 0.18,
    3: 0.12,
    4: 0.09,
    5: 0.09,
    6: 0.06,
    7: 0.04,
    8: 0.03,
    9: 0.03,
  };

  private fundPercent = 0.1;
  private merchantPercent = 0.7;

  constructor(
    @Inject(forwardRef(() => ContentService))
    private readonly contentService: ContentService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => PurchaseService))
    private readonly purchaseService: PurchaseService,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly subscriptionsService: SubscriptionsService,
    private readonly referralsService: ReferralsService,
    private readonly transactionsService: TransactionsService,
    private readonly fundsService: FundsService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @OnEvent(PurchaseEvents.CREATED)
  async onPurchaseCreated({ purchaseId }: PurchaseCreatedEvent) {
    const purchase = await this.purchaseService.populate({ purchaseId });

    if (!purchase) {
      throw new NotFoundException('Покупка не найдена');
    }

    const transaction = await this.transactionsService.find({
      transactionId: purchase.transactionId,
    });

    if (!transaction) {
      throw new Error('Транзакция не найдена');
    }

    switch (purchase.type) {
      case PurchaseType.TRAINING: {
        const training = await this.contentService.findTraining({
          trainingId: purchase.contentId,
        });

        if (!training) {
          throw new Error('Тренинг не найден');
        }

        if (training.stage && training.stageLevel) {
          await this.addStageReward(purchase, training, transaction);
        } else {
          await this.addTrainingReward(purchase, transaction);
        }

        break;
      }
      case PurchaseType.PRACTISE: {
        break;
      }
      case PurchaseType.LESSON: {
        await this.addLessonReward(purchase, transaction);
        break;
      }
      case PurchaseType.SUBSCRIPTION: {
        await this.addSubscriptionReward(purchase, transaction);
        break;
      }
      default: {
        break;
      }
    }
  }

  private async addStageReward(
    purchase: PurchaseEntity,
    training: TrainingEntity,
    transaction: TransactionEntity
  ) {
    if (!(training.stage && training.stageLevel)) {
      return;
    }

    const level = Math.floor(training.stage / training.stageLevel);
    const sum =
      Math.round(Math.abs(transaction.sum * (1 - this.fundPercent)) * 1000) /
      1000;

    // Пополняем банк
    const fundComission =
      Math.round(Math.abs(transaction.sum) * this.fundPercent * 1000) / 1000;

    await this.fundsService.incMain(fundComission);
    await this.transactionsService.create({
      userId: +purchase.userId,
      type: TransactionType.FUND,
      sum: fundComission,
      fundType: FundType.MAIN,
      description: `Комиссия за покупку ступени`,
    });

    const partner = await this.referralsService.find({
      referralId: purchase.userId,
      level,
    });

    if (!partner) {
      await this.fundsService.incAdmin(sum);

      await this.transactionsService.create({
        userId: +purchase.userId,
        type: TransactionType.FUND,
        sum: sum,
        fundType: FundType.ADMIN,
        description: `Комиссия за отсутствие партнёра ${level} уровня`,
      });

      return;
    }

    const partnerSubscription = await this.subscriptionsService.find({
      userId: partner.partnerId,
    });

    if (!partnerSubscription) {
      throw new NotFoundException('Подписка партнера не найдена');
    }

    const partnerPurchase = await this.purchaseService.find({
      userId: partner.partnerId,
      contentId: training.trainingId,
    });

    if (partnerPurchase) {
      if (partnerSubscription.isActive()) {
        // Обновляем балансы
        await this.referralsService.incEarn(partner, { inc: sum });
        await this.usersService.incBalance(
          {
            userId: partner.partnerId,
          },
          {
            inc: sum,
          }
        );

        await this.transactionsService.create({
          userId: partner.partnerId,
          type: TransactionType.REFERRAL,
          sum: sum,
          description: `Ваш Единомышленник в ${level} поколении открыл ${training.stage} Ступень Духа.\nВы получили +${sum} ОМ`,
        });

        await this.eventEmitter.emit(
          ReferralEvents.BUY_STAGE,
          new ReferralBuyStageEvent(
            partner.partnerId,
            partner.referralId,
            partner.level,
            sum,
            training.stageLevel,
            training.stage
          )
        );
      } else {
        await this.fundsService.createReserveItem({
          type: ReserveFundItemType.SUBSCRIPTION,
          userId: partner.partnerId,
          sum,
          stage: training.stage,
          stageLevel: training.stageLevel,
          endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
          referralId: purchase.userId,
        });

        await this.eventEmitter.emit(
          ReferralEvents.RESERVE_STAGE_BY_STAGE,
          new ReferralReserveStageBySubscriptionEvent(
            partner.partnerId,
            partner.referralId,
            partner.level,
            sum,
            training.stageLevel,
            training.stage
          )
        );
      }
    } else {
      await this.fundsService.createReserveItem({
        type: ReserveFundItemType.STAGE,
        userId: partner.partnerId,
        sum,
        stage: training.stage,
        stageLevel: training.stageLevel,
        endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
        referralId: purchase.userId,
      });

      await this.eventEmitter.emit(
        ReferralEvents.RESERVE_STAGE_BY_STAGE,
        new ReferralReserveStageByStageEvent(
          partner.partnerId,
          partner.referralId,
          partner.level,
          sum,
          training.stageLevel,
          training.stage
        )
      );
    }
  }

  private async addSubscriptionReward(
    purchase: PurchaseEntity,
    transaction: TransactionEntity
  ) {
    // Пополняем банк
    const fundComission =
      Math.round(Math.abs(transaction.sum) * this.fundPercent * 1000) / 1000;

    await this.fundsService.incMain(fundComission);
    await this.transactionsService.create({
      userId: +purchase.userId,
      type: TransactionType.FUND,
      sum: fundComission,
      fundType: FundType.MAIN,
      description: `Комиссия за покупку подписки`,
    });

    for (const [_level, percent] of Object.entries(this.levelPercents)) {
      const level = +_level;

      const sum =
        Math.round(
          Math.abs(transaction.sum) * (1 - this.fundPercent) * percent * 1000
        ) / 1000;

      const partner = await this.referralsService.find({
        referralId: purchase.userId,
        level,
      });

      if (!partner) {
        await this.fundsService.incAdmin(sum);

        await this.transactionsService.create({
          userId: +purchase.userId,
          type: TransactionType.FUND,
          sum: sum,
          fundType: FundType.ADMIN,
          description: `Комиссия за отсутствие партнёра ${level} уровня`,
        });

        continue;
      }

      const partnerSubscription = await this.subscriptionsService.find({
        userId: partner.partnerId,
      });

      if (!partnerSubscription) {
        throw new NotFoundException('Подписка партнера не найдена');
      }

      if (partnerSubscription.isActive()) {
        // Обновляем балансы
        await this.referralsService.incEarn(partner, { inc: sum });
        await this.usersService.incBalance(
          {
            userId: partner.partnerId,
          },
          {
            inc: sum,
          }
        );

        await this.transactionsService.create({
          userId: partner.partnerId,
          type: TransactionType.REFERRAL,
          sum: sum,
          description: `Ваш Единомышленник в ${level} поколении приобрел доступ на ${
            purchase.days
          } ${formatDays(purchase.days as number)}.\nВы получили +${sum} OM (${
            percent * 100
          }%).`,
        });

        await this.eventEmitter.emit(
          ReferralEvents.BUY,
          new ReferralBuyEvent(
            partner.partnerId,
            partner.referralId,
            partner.level,
            sum,
            `Доступ на ${purchase.days} ${formatDays(purchase.days as number)}`
          )
        );
      } else {
        await this.fundsService.createReserveItem({
          type: ReserveFundItemType.SUBSCRIPTION,
          userId: partner.partnerId,
          sum,
          endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
          referralId: purchase.userId,
        });

        await this.eventEmitter.emit(
          ReferralEvents.RESERVE_BY_SUBSCRIPTION,
          new ReferralReserveBySubscriptionEvent(
            partner.partnerId,
            partner.referralId,
            sum,
            `Доступ на ${purchase.days} ${formatDays(purchase.days as number)}`
          )
        );
      }
    }
  }

  private async addTrainingReward(
    purchase: PurchaseEntity,
    transaction: TransactionEntity
  ) {
    // Пополняем банк
    const fundComission =
      Math.round(Math.abs(transaction.sum) * this.fundPercent * 1000) / 1000;

    await this.fundsService.incMain(fundComission);
    await this.transactionsService.create({
      userId: +purchase.userId,
      type: TransactionType.FUND,
      sum: fundComission,
      fundType: FundType.MAIN,
      description: `Комиссия за покупку тренинга`,
    });

    for (const [_level, percent] of Object.entries(this.levelPercents)) {
      const level = +_level;

      const sum =
        Math.round(
          Math.abs(transaction.sum) * (1 - this.fundPercent) * percent * 1000
        ) / 1000;

      const partner = await this.referralsService.find({
        referralId: purchase.userId,
        level,
      });

      if (!partner) {
        await this.fundsService.incAdmin(sum);

        await this.transactionsService.create({
          userId: +purchase.userId,
          type: TransactionType.FUND,
          sum: sum,
          fundType: FundType.ADMIN,
          description: `Комиссия за отсутствие партнёра ${level} уровня`,
        });

        continue;
      }

      const training = await this.contentService.findTraining({
        trainingId: purchase.contentId,
      });

      if (!training) {
        throw new NotFoundException('Тренинг не найден');
      }

      const stageTraining = await this.contentService.findTraining({
        stageLevel: 1,
        stage: level,
      });

      if (!stageTraining) {
        throw new NotFoundException('Тренинг не найден');
      }

      const partnerPurchase = await this.purchaseService.find({
        userId: partner.partnerId,
        contentId: stageTraining.trainingId,
      });

      const partnerSubscription = await this.subscriptionsService.find({
        userId: partner.partnerId,
      });

      if (!partnerSubscription) {
        throw new NotFoundException('Подписка партнера не найдена');
      }

      if (partnerPurchase) {
        if (partnerSubscription.isActive()) {
          // Обновляем балансы
          await this.referralsService.incEarn(partner, { inc: sum });
          await this.usersService.incBalance(
            {
              userId: partner.partnerId,
            },
            {
              inc: sum,
            }
          );

          await this.transactionsService.create({
            userId: partner.partnerId,
            type: TransactionType.REFERRAL,
            sum: sum,
            description: `Ваш Единомышленник в ${level} поколении приобрел ${
              training.title
            }.\nВы получили +${sum} OM (${percent * 100}%).`,
          });

          await this.eventEmitter.emit(
            ReferralEvents.BUY,
            new ReferralBuyEvent(
              partner.partnerId,
              partner.referralId,
              partner.level,
              sum,
              training.title ?? ''
            )
          );
        } else {
          await this.fundsService.createReserveItem({
            type: ReserveFundItemType.SUBSCRIPTION,
            userId: partner.partnerId,
            sum,
            stage: stageTraining.stage,
            stageLevel: stageTraining.stageLevel,
            endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
            referralId: purchase.userId,
          });

          await this.eventEmitter.emit(
            ReferralEvents.RESERVE_BY_SUBSCRIPTION,
            new ReferralReserveBySubscriptionEvent(
              partner.partnerId,
              partner.referralId,
              sum,
              training.title ?? ''
            )
          );
        }
      } else {
        await this.fundsService.createReserveItem({
          type: ReserveFundItemType.STAGE,
          userId: partner.partnerId,
          sum,
          stage: stageTraining.stage,
          stageLevel: stageTraining.stageLevel,
          endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
          referralId: purchase.userId,
        });

        await this.eventEmitter.emit(
          ReferralEvents.RESERVE_BY_STAGE,
          new ReferralReserveByStageEvent(
            partner.partnerId,
            partner.referralId,
            sum,
            stageTraining.stageLevel ?? 1,
            stageTraining.stage ?? level,
            training.title ?? ''
          )
        );
      }
    }
  }

  private async addLessonReward(
    purchase: PurchaseEntity,
    transaction: TransactionEntity
  ) {
    // Пополняем банк
    const fundComission =
      Math.round(Math.abs(transaction.sum) * this.fundPercent * 1000) / 1000;

    await this.fundsService.incMain(fundComission);
    await this.transactionsService.create({
      userId: +purchase.userId,
      type: TransactionType.FUND,
      sum: fundComission,
      fundType: FundType.MAIN,
      description: `Комиссия за покупку тренинга`,
    });

    for (const [level, percent] of Object.entries(this.levelPercents)) {
      const sum =
        Math.round(
          Math.abs(transaction.sum) * (1 - this.fundPercent) * percent * 1000
        ) / 1000;

      const partner = await this.referralsService.find({
        referralId: purchase.userId,
        level,
      });

      if (!partner) {
        await this.fundsService.incAdmin(sum);

        await this.transactionsService.create({
          userId: +purchase.userId,
          type: TransactionType.FUND,
          sum: sum,
          fundType: FundType.ADMIN,
          description: `Комиссия за отсутствие партнёра ${level} уровня`,
        });

        continue;
      }

      const lesson = await this.contentService.findLesson({
        lessonId: purchase.contentId,
      });

      // Обновляем балансы
      await this.referralsService.incEarn(partner, { inc: sum });
      await this.usersService.incBalance(
        {
          userId: partner.partnerId,
        },
        {
          inc: sum,
        }
      );

      await this.transactionsService.create({
        userId: partner.partnerId,
        type: TransactionType.REFERRAL,
        sum: sum,
        description: `Ваш Единомышленник в ${level} поколении приобрел ${
          lesson?.title
        }.\nВы получили +${sum} OM (${percent * 100}%).`,
      });

      await this.eventEmitter.emit(
        ReferralEvents.BUY,
        new ReferralBuyEvent(
          partner.partnerId,
          partner.referralId,
          partner.level,
          sum,
          lesson?.title ?? ''
        )
      );
    }
  }

  @OnEvent(PurchaseEvents.PRACTISE_DONE)
  async onPractiseDone({ userId, trainingId }: PurchasePractiseDoneEvent) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const purchase = await this.purchaseService.find({
      type: PurchaseType.PRACTISE,
      userId,
      contentId: trainingId,
    });

    if (!purchase) {
      throw new NotFoundException('Покупка не найдена');
    }

    const transaction = await this.transactionsService.find({
      transactionId: purchase.transactionId,
    });

    if (!transaction) {
      throw new NotFoundException('Транзакция не найдена');
    }

    const practise = await this.contentService.findTraining({ trainingId });

    if (!practise) {
      throw new NotFoundException('Практика не найдена');
    }

    for (const [_level, percent] of Object.entries(this.levelPercents)) {
      const level = +_level;

      const sum =
        Math.round(
          Math.abs(transaction.sum) *
            (1 - this.merchantPercent - this.fundPercent) *
            percent *
            1000
        ) / 1000;

      const partner = await this.referralsService.find({
        referralId: purchase.userId,
        level,
      });

      if (!partner) {
        await this.fundsService.incAdmin(sum);

        await this.transactionsService.create({
          userId: +purchase.userId,
          type: TransactionType.FUND,
          sum: sum,
          fundType: FundType.ADMIN,
          description: `Комиссия за отсутствие партнёра ${level} уровня`,
        });

        continue;
      }

      const stageTraining = await this.contentService.findTraining({
        stageLevel: 1,
        stage: level,
      });

      if (!stageTraining) {
        throw new NotFoundException('Тренинг не найден');
      }

      const partnerPurchase = await this.purchaseService.find({
        userId: partner.partnerId,
        contentId: stageTraining.trainingId,
      });

      const partnerSubscription = await this.subscriptionsService.find({
        userId: partner.partnerId,
      });

      if (!partnerSubscription) {
        throw new NotFoundException('Подписка партнера не найдена');
      }

      if (partnerPurchase) {
        if (partnerSubscription.isActive()) {
          // Обновляем балансы
          await this.referralsService.incEarn(partner, { inc: sum });
          await this.usersService.incBalance(
            {
              userId: partner.partnerId,
            },
            {
              inc: sum,
            }
          );

          await this.transactionsService.create({
            userId: partner.partnerId,
            type: TransactionType.REFERRAL,
            sum: sum,
            description: `Ваш Единомышленник в ${level} поколении прошёл практику ${
              practise.title
            }.\nВы получили +${sum} OM (${percent * 100}%).`,
          });

          await this.eventEmitter.emit(
            ReferralEvents.BUY_PRACTISE,
            new ReferralBuyPractiseEvent(
              partner.partnerId,
              partner.referralId,
              partner.level,
              sum,
              practise?.title ?? ''
            )
          );

          // Пополняем банк
          const fundComission = Math.round(Math.abs(transaction.sum) * this.fundPercent * 1000) / 1000;

          await this.fundsService.incMain(fundComission);
          await this.transactionsService.create({
            userId: +purchase.userId,
            type: TransactionType.FUND,
            sum: fundComission,
            fundType: FundType.MAIN,
            description: `Комиссия за проведение практики`,
          });
        } else {
          await this.fundsService.createReserveItem({
            type: ReserveFundItemType.SUBSCRIPTION,
            userId: partner.partnerId,
            sum,
            stage: stageTraining.stage,
            stageLevel: stageTraining.stageLevel,
            endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
            referralId: purchase.userId,
          });

          await this.eventEmitter.emit(
            ReferralEvents.RESERVE_BY_SUBSCRIPTION,
            new ReferralReserveBySubscriptionEvent(
              partner.partnerId,
              partner.referralId,
              sum,
              practise.title ?? ''
            )
          );
        }
      } else {
        await this.fundsService.createReserveItem({
          type: ReserveFundItemType.STAGE,
          userId: partner.partnerId,
          sum,
          stage: stageTraining.stage,
          stageLevel: stageTraining.stageLevel,
          endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
          referralId: purchase.userId,
        });

        await this.eventEmitter.emit(
          ReferralEvents.RESERVE_BY_STAGE,
          new ReferralReserveByStageEvent(
            partner.partnerId,
            partner.referralId,
            sum,
            stageTraining.stageLevel ?? 1,
            stageTraining.stage ?? level,
            practise.title ?? ''
          )
        );
      }
    }

    const training = await this.contentService.findTraining({
      trainingId,
    });

    if (!training) {
      throw new NotFoundException('Практика не найдена');
    }

    const merchant = await this.usersService.find({
      userId: training.merchantId,
    });

    if (merchant) {
      const merchantSum = Math.round(Math.abs(transaction.sum) * this.merchantPercent * 1000) / 1000;

      await this.usersService.incBalance(
        { userId: merchant.userId },
        { inc: merchantSum }
      );

      await this.transactionsService.create({
        userId: merchant.userId,
        type: TransactionType.MERCHANT,
        sum: merchantSum,
        description: `Вознаграждение +${merchantSum} OM за ${training.title}`,
      });
    }

    const reserveItem = await this.fundsService.findReserveItem({
      type: ReserveFundItemType.PRACTISE,
      userId: purchase.userId,
      trainingId: purchase.contentId,
    });

    reserveItem && (await this.fundsService.deleteReserveItem(reserveItem));
  }

  @OnEvent(PurchaseEvents.PRACTISE_ABORT)
  async onPractiseAbort({ userId, trainingId }: PurchasePractiseAbortEvent) {
    const user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const purchase = await this.purchaseService.find({
      type: PurchaseType.PRACTISE,
      userId,
      contentId: trainingId,
    });

    if (!purchase) {
      throw new NotFoundException('Покупка не найдена');
    }

    const transaction = await this.transactionsService.find({
      transactionId: purchase.transactionId,
    });

    if (!transaction) {
      throw new NotFoundException('Транзакция не найдена');
    }

    const practise = await this.contentService.findTraining({ trainingId });

    const sum = Math.abs(transaction.sum);

    await this.fundsService.decReserve(sum);

    await this.transactionsService.create({
      userId,
      type: TransactionType.PURCHASE,
      sum: sum,
      description: `${sum} OM за ${practise?.title} были возвращены`,
    });

    await this.usersService.incBalance({ userId }, { inc: sum });

    const reserveItem = await this.fundsService.findReserveItem({
      type: ReserveFundItemType.PRACTISE,
      userId: purchase.userId,
      trainingId: purchase.contentId,
    });

    reserveItem && (await this.fundsService.deleteReserveItem(reserveItem));
  }
}
