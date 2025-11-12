// learning.listener.ts
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  PurchaseCreatedEvent,
  PurchaseEvents,
  PurchaseType,
  TransactionType,
} from '@trinity/shared';
import { PurchaseService, TransactionsService } from '../../billing';
import { ContentService } from '../../lms';
import { ReferralsService } from './referrals.service';
import { UsersService } from '../../account';
import { FundsService } from '../funds';

@Injectable()
export class ReferralsListener {
  constructor(
    @Inject(forwardRef(() => ContentService))
    private readonly contentService: ContentService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => PurchaseService))
    private readonly purchaseService: PurchaseService,
    private readonly referralsService: ReferralsService,
    private readonly transactionsService: TransactionsService,
    private readonly fundsService: FundsService
  ) {}

  @OnEvent(PurchaseEvents.CREATED)
  async onPurchaseCreated({ purchaseId }: PurchaseCreatedEvent) {
    console.log(`✅ Покупка ${purchaseId} создана`);

    const purchase = await this.purchaseService.populate({ purchaseId });

    if (!purchase) {
      throw new NotFoundException('Покупка не найдена');
    }

    switch (purchase.type) {
      case PurchaseType.TRAINING: {
        const training = await this.contentService.findTraining({
          trainingId: purchase.contentId,
        });

        if (!training) {
          throw new Error('Тренинг не найден');
        }

        const transaction = await this.transactionsService.find({
          transactionId: purchase.transactionId,
        });

        if (!transaction) {
          throw new Error('Транзакция не найдена');
        }

        const levelPercents = {
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

        const fundPercent = 0.1;

        for (const [level, percent] of Object.entries(levelPercents)) {
          const sum = transaction.sum * percent;

          const referral = await this.referralsService.find({
            referralId: purchase.userId,
            level,
          });

          if (!referral) {
            throw new Error('Реферал не найден');
          }

          // Если куплена ступень
          if (training.stage && training.stageLevel) {
            const referralPurchase = await this.purchaseService.find({
              userId: referral.partnerId,
              contentId: training.trainingId,
            });

            if (referralPurchase) {
              // Обновляем балансы
              await this.referralsService.incEarn(referral, { inc: sum });
              await this.usersService.incBalance(
                {
                  userId: referral.partnerId,
                },
                {
                  inc: sum,
                }
              );

              await this.transactionsService.create({
                userId: referral.partnerId,
                type: TransactionType.REFERRAL,
                sum: sum,
                description: 'Реферальное вознаграждение',
              });

              // Пополняем банк
              await this.fundsService.incMain(transaction.sum * fundPercent);
            } else {
              await this.fundsService.createReserveItem({
                userId: referral.partnerId,
                sum,
                stage: training.stage,
                stageLevel: training.stageLevel,
              });
            }
          }
        }

        break;
      }
      case PurchaseType.LESSON: {
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
}
