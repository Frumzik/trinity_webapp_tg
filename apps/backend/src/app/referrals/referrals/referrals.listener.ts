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

@Injectable()
export class ReferralsListener {
  private levelPercents = {
    1: 0.36,
    2: 0.18,
    3: 0.12,
    4: 0.9,
    5: 0.9,
    6: 0.6,
    7: 0.4,
    8: 0.3,
    9: 0.3,
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
    const sum = Math.abs(transaction.sum) * (1 - this.fundPercent);

    const partner = await this.referralsService.find({
      referralId: purchase.userId,
      level,
    });

    if (!partner) {
      await this.fundsService.incMain(sum);

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

    if (partnerSubscription.isActive()) {
      if (partnerPurchase) {
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
          description: `Реферальное вознаграждение за ${level} ступень`,
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

        // Пополняем банк
        await this.fundsService.incMain(
          Math.abs(transaction.sum) * this.fundPercent
        );
      } else {
        await this.fundsService.createReserveItem({
          type: ReserveFundItemType.STAGE,
          userId: partner.partnerId,
          sum,
          stage: training.stage,
          stageLevel: training.stageLevel,
          endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
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
    } else {
      await this.fundsService.createReserveItem({
        type: ReserveFundItemType.SUBSCRIPTION,
        userId: partner.partnerId,
        sum,
        stage: training.stage,
        stageLevel: training.stageLevel,
        endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
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
  }

  private async addTrainingReward(
    purchase: PurchaseEntity,
    transaction: TransactionEntity
  ) {
    {
      for (const [level, percent] of Object.entries(this.levelPercents)) {
        const sum = Math.abs(transaction.sum) * percent;

        const partner = await this.referralsService.find({
          referralId: purchase.userId,
          level,
        });

        if (!partner) {
          await this.fundsService.incMain(sum);

          continue;
        }

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
          description: `Реферальное вознаграждение за ${level} ступень`,
        });

        // Пополняем банк
        await this.fundsService.incMain(
          Math.abs(transaction.sum) * this.fundPercent
        );

        await this.eventEmitter.emit(
          ReferralEvents.BUY,
          new ReferralBuyEvent(
            partner.partnerId,
            partner.referralId,
            partner.level,
            sum,
            ''
          )
        );
      }
    }
  }

  private async addLessonReward(
    purchase: PurchaseEntity,
    transaction: TransactionEntity
  ) {
    for (const [level, percent] of Object.entries(this.levelPercents)) {
      const sum = Math.abs(transaction.sum) * percent;

      const partner = await this.referralsService.find({
        referralId: purchase.userId,
        level,
      });

      if (!partner) {
        continue;
      }

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
        description: `Реферальное вознаграждение за ${level} ступень`,
      });

      // Пополняем банк
      await this.fundsService.incMain(
        Math.abs(transaction.sum) * this.fundPercent
      );

      await this.eventEmitter.emit(
        ReferralEvents.BUY,
        new ReferralBuyEvent(
          partner.partnerId,
          partner.referralId,
          partner.level,
          sum,
          ''
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

    for (const [level, percent] of Object.entries(this.levelPercents)) {
      const sum =
        Math.abs(transaction.sum) *
        (1 - this.merchantPercent - this.fundPercent) *
        percent;

      const partner = await this.referralsService.find({
        referralId: purchase.userId,
        level,
      });

      if (!partner) {
        continue;
      }

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
        description: `Реферальное вознаграждение за ${level} ступень`,
      });

      // Пополняем банк
      await this.fundsService.incMain(
        Math.abs(transaction.sum) * this.fundPercent
      );
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
      const merchantSum = Math.abs(transaction.sum) * this.merchantPercent;

      await this.usersService.incBalance(
        { userId: merchant.userId },
        { inc: merchantSum }
      );

      await this.transactionsService.create({
        userId: merchant.userId,
        type: TransactionType.MERCHANT,
        sum: merchantSum,
        description: `Награда за проведение практики ${training.title}`,
      });
    }
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

    await this.fundsService.decReserve(Math.abs(transaction.sum));

    await this.transactionsService.create({
      userId,
      type: TransactionType.PURCHASE,
      sum: Math.abs(transaction.sum),
      description: `Возврат практики`,
    });

    await this.usersService.incBalance({ userId }, { inc: Math.abs(transaction.sum) });
  }
}
