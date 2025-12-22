// learning.listener.ts
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  PurchaseBuyEvent,
  PurchaseBuyPractiseEvent,
  PurchaseBuyStageEvent,
  PurchaseCreatedEvent,
  PurchaseEvents,
  PurchaseType,
  ReferralEvents,
  ReferralReserveStageReturnedEvent,
  ReserveFundItemType,
  TrainingType,
  TransactionType,
} from '@trinity/shared';
import { PurchaseService, TransactionsService } from '../../billing';
import { ContentService } from '../../lms';
import { UsersService } from '../../account';
import { FundsService, ReferralsService } from '../../referrals';

@Injectable()
export class PurchaseListener {
  constructor(
    @Inject(forwardRef(() => ContentService))
    private readonly contentService: ContentService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => PurchaseService))
    private readonly purchaseService: PurchaseService,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,
    private readonly fundsService: FundsService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => ReferralsService))
    private readonly referralsService: ReferralsService
  ) {}

  @OnEvent(PurchaseEvents.CREATED)
  async onPurchaseCreated({ purchaseId }: PurchaseCreatedEvent) {
    console.log(`✅ Покупка ${purchaseId} создана`);

    const purchase = await this.purchaseService.populate({ purchaseId });

    if (!purchase) {
      throw new NotFoundException('Покупка не найдена');
    }

    const transaction = await this.transactionsService.find({
      transactionId: purchase.transactionId,
    });

    if (!transaction) {
      throw new NotFoundException('Транзакция не найдена');
    }

    switch (purchase.type) {
      case PurchaseType.TRAINING: {
        const training = await this.contentService.findTraining({
          trainingId: purchase.contentId,
        });

        if (!training) {
          throw new Error('Тренинг не найден');
        }

        if (
          training.type == TrainingType.TRAINING &&
          !(training.stage && training.stageLevel)
        ) {
          this.eventEmitter.emit(
            PurchaseEvents.BUY,
            new PurchaseBuyPractiseEvent(purchase.userId, training.trainingId)
          );
        } else if (training.stage && training.stageLevel) {
          // Событие
          await this.eventEmitter.emit(
            PurchaseEvents.BUY_STAGE,
            new PurchaseBuyStageEvent(
              purchase.userId,
              training.stage,
              training.stageLevel
            )
          );

          const reserveItems = await this.fundsService.findReserveItemAll({
            filter: {
              type: ReserveFundItemType.STAGE,
              userId: purchase.userId,
              stage: training.stage,
              stageLevel: training.stageLevel,
            },
          });

          let reserveSum = 0;
          for (const reserveItem of reserveItems) {
            if (reserveItem && reserveItem.endDate) {
              // Если срок ещё не истёк
              if (
                new Date().getTime() < new Date(reserveItem.endDate).getTime()
              ) {
                // Убираем из резерва
                await this.fundsService.returnReserveItem(reserveItem, true);
                reserveSum += reserveItem.sum;

                await this.referralsService.incEarn(
                  {
                    partnerId: reserveItem.userId,
                    referralId: reserveItem.referralId,
                  },
                  { inc: reserveItem.sum }
                );
              }
            }
          }

          if (reserveItems.length) {
            await this.eventEmitter.emit(
              ReferralEvents.RESERVE_STAGE_RETURNED,
              new ReferralReserveStageReturnedEvent(purchase.userId, reserveSum)
            );

            await this.transactionsService.create({
              userId: purchase.userId,
              type: TransactionType.REFERRAL,
              sum: reserveSum,
              description: `Вознаграждение ${reserveSum} ОМ возвращено вам из Резервного Фонда.\nВы открыли необходимую ступень`,
            });

            await this.usersService.incBalance(
              { userId: purchase.userId },
              { inc: reserveSum }
            );
          }
        } else {
          // Событие
          await this.eventEmitter.emit(
            PurchaseEvents.BUY,
            new PurchaseBuyEvent(
              purchase.userId,
              Math.abs(transaction.sum),
              training.title ?? ''
            )
          );
        }

        break;
      }
      case PurchaseType.LESSON: {
        const lesson = await this.contentService.findLesson({
          lessonId: purchase.contentId,
        });

        if (!lesson) {
          throw new NotFoundException('Урок не найден');
        }
        // Событие
        await this.eventEmitter.emit(
          PurchaseEvents.BUY,
          new PurchaseBuyEvent(
            purchase.userId,
            Math.abs(transaction.sum),
            lesson.title ?? ''
          )
        );
        break;
      }
      case PurchaseType.SUBSCRIPTION: {
        const reserveItems = await this.fundsService.findReserveItemAll({
          filter: {
            type: ReserveFundItemType.SUBSCRIPTION,
            userId: purchase.userId,
          },
        });

        let reserveSum = 0;

        for (const reserveItem of reserveItems) {
          // Убираем из резерва
          await this.fundsService.returnReserveItem(reserveItem, true);

          reserveSum += reserveItem.sum;

          await this.referralsService.incEarn(
            {
              partnerId: reserveItem.userId,
              referralId: reserveItem.referralId,
            },
            { inc: reserveItem.sum }
          );
        }

        if (reserveSum > 0) {
          await this.transactionsService.create({
            userId: purchase.userId,
            type: TransactionType.REFERRAL,
            sum: reserveSum,
            description: `Вознаграждение ${reserveSum} OM возвращено вам из Резервного Фонда.\nВы активировали доступ вовремя.`,
          });

          await this.usersService.incBalance(
            { userId: purchase.userId },
            { inc: reserveSum }
          );

          await this.eventEmitter.emit(
            ReferralEvents.RESERVE_SUBSCRIPTION_RETURNED,
            new ReferralReserveSubscriptionReturnedEvent(
              purchase.userId,
              reserveSum
            )
          );
        }

        break;
      }
      case PurchaseType.PRACTISE: {
        await this.eventEmitter.emit(
          PurchaseEvents.BUY_PRACTISE,
          new PurchaseBuyPractiseEvent(
            purchase.userId,
            purchase.contentId as number
          )
        );

        break;
      }

      default: {
        break;
      }
    }
  }
}
