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
import { UsersService } from '../../account';
import { FundsService } from '../../referrals';

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

        if (training.stage && training.stageLevel) {
          const reserveItem = await this.fundsService.findReserveItem({
            userId: purchase.userId,
            stage: training.stage,
            stageLevel: training.stageLevel,
            isReturned: false,
          });

          if (reserveItem) {
            // Если срок ещё не истёк
            if (
              new Date().getTime() < new Date(reserveItem.endDate).getTime()
            ) {
              // Убираем из резерва
              await this.fundsService.setIsReturnReserveItem(reserveItem, {
                isReturned: true,
              });

              await this.transactionsService.create({
                userId: purchase.userId,
                type: TransactionType.REFERRAL,
                sum: reserveItem.sum,
                description: 'Реферальное вознаграждение',
              });

              await this.usersService.incBalance(
                { userId: purchase.userId },
                { inc: reserveItem.sum }
              );
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
