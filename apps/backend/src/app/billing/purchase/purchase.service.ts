import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import {
  Purchase,
  PurchaseEntity,
  SubscriptionsService,
  TransactionsService,
} from '../../billing';
import { PurchasesRepository } from './repositories';
import {
  CounterType,
  PurchaseCreatedEvent,
  PurchaseCreateRequestDto,
  PurchaseEvents,
  PurchaseType,
  ReserveFundItemType,
  TransactionType,
} from '@trinity/shared';
import { CountersService } from '../../service';
import { UsersService } from '../../account';
import { ContentService } from '../../lms';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FundsService } from '../../referrals';
import { NotificationsService } from '../../notifications';

@Injectable()
export class PurchaseService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly subscirptionsService: SubscriptionsService,
    @Inject(forwardRef(() => ContentService))
    private readonly contentService: ContentService,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,
    private readonly purchasesRepository: PurchasesRepository,
    private readonly countersService: CountersService,
    private readonly fundsService: FundsService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService
  ) {}

  async create(
    userId: number,
    dto: PurchaseCreateRequestDto
  ): Promise<boolean> {
    try {
      let user = await this.usersService.find({ userId });

      if (!user) {
        throw new NotFoundException('пользователь не найден');
      }

      // Проверка существует ли покупка
      if (
        dto.type == PurchaseType.LESSON ||
        dto.type == PurchaseType.TRAINING
      ) {
        for (const contentId of dto.content as number[]) {
          const existPurchase = await this.find({
            type: dto.type,
            contentId,
            userId,
          });

          if (existPurchase) {
            throw new Error('Покупка уже существует');
          }
        }
      }

      // Проверка что контент существует
      let totalPrice = 0;
      switch (dto.type) {
        case PurchaseType.PRACTISE:
        case PurchaseType.TRAINING: {
          const trainings = await Promise.all(
            (dto.content ?? []).map((trainingId) =>
              this.contentService.findTraining({ trainingId })
            )
          );

          // Проверяем, что все тренинги найдены
          const allExist = trainings.every((training) => !!training);

          if (!allExist) {
            throw new BadRequestException('Некоторые тренинги не найдены');
          }

          // Суммируем стоимость
          totalPrice = trainings.reduce(
            (sum, training) =>
              sum +
              (dto.sale && training.salePrice
                ? training.salePrice ?? 0
                : training.price ?? 0),
            0
          );

          break;
        }
        case PurchaseType.LESSON: {
          const lessons = await Promise.all(
            (dto.content ?? []).map((lessonId) =>
              this.contentService.findLesson({ lessonId })
            )
          );

          // Проверяем, что все тренинги найдены
          const allExist = lessons.every((lesson) => !!lesson);

          if (!allExist) {
            throw new BadRequestException('Некоторые уроки не найдены');
          }

          totalPrice = lessons.reduce(
            (sum, lesson) =>
              sum +
              (dto.sale && lesson.salePrice
                ? lesson.salePrice ?? 0
                : lesson.price ?? 0),
            0
          );

          break;
        }
        case PurchaseType.SUBSCRIPTION: {
          totalPrice = dto.subscriptionSum ?? 0;
          break;
        }
        default:
          break;
      }

      // Проверка на баланс
      if (user.balance < totalPrice) {
        throw new Error('Недостаточно баланса');
      }

      if (
        dto.type == PurchaseType.LESSON ||
        dto.type == PurchaseType.PRACTISE ||
        dto.type == PurchaseType.TRAINING
      ) {
        for (const contentId of dto.content as number[]) {
          let transactionSum = 0;

          let transactionDescription = '';

          switch (dto.type) {
            case PurchaseType.PRACTISE:
            case PurchaseType.TRAINING: {
              const training = await this.contentService.findTraining({
                trainingId: contentId,
              });

              if (!training) {
                throw new NotFoundException('Тренинг не найден');
              }

              transactionSum =
                dto.sale && training.salePrice
                  ? training.salePrice ?? 0
                  : training.price ?? 0;

              transactionDescription = `Покупка ${
                dto.type == PurchaseType.PRACTISE ? 'практики' : 'курса'
              } "${training.title}"`;

              if (dto.type == PurchaseType.PRACTISE) {
                await this.fundsService.createReserveItem({
                  type: ReserveFundItemType.PRACTISE,
                  trainingId: training.trainingId,
                  sum: -transactionSum,
                  userId: user.userId,
                });

                await this.notificationsService.sendBotNewPractise(
                  user,
                  training
                );
              }

              break;
            }
            case PurchaseType.LESSON: {
              const lesson = await this.contentService.findLesson({
                lessonId: contentId,
              });

              if (!lesson) {
                throw new NotFoundException('Урок не найден');
              }

              transactionSum =
                dto.sale && lesson.salePrice
                  ? lesson.salePrice ?? 0
                  : lesson.price ?? 0;

              transactionDescription = `Покупка урока ${lesson.title}`;

              break;
            }
            default:
              break;
          }

          const transaction = await this.transactionsService.create({
            type: TransactionType.PURCHASE,
            userId: user.userId,
            sum: -transactionSum,
            description: transactionDescription,
          });

          if (!transaction) {
            throw new Error('Ошибка создания транзакции');
          }

          const newPurchaseEntity = new PurchaseEntity({
            purchaseId: await this.countersService.saveNextSequence(
              CounterType.PURCHASE_ID
            ),
            type: dto.type,

            user: user._id,
            userId: user.userId,

            transaction: transaction._id,
            transactionId: transaction.transactionId,

            contentId,
          });

          const created = await this.purchasesRepository.create(
            newPurchaseEntity
          );

          this.eventEmitter.emit(
            PurchaseEvents.CREATED,
            new PurchaseCreatedEvent(created.purchaseId)
          );

          user = await this.usersService.decBalance(
            { userId: user.userId },
            { dec: transactionSum }
          );
        }
      } else if (dto.type == PurchaseType.SUBSCRIPTION) {
        const transaction = await this.transactionsService.create({
          type: TransactionType.SUBSCRIPTION,
          userId: user.userId,
          sum: -totalPrice,
          description: `Продление подписки на ${dto.subscriptionDays} дней`,
        });

        if (!transaction) {
          throw new Error('Ошибка создания транзакции');
        }

        const newPurchaseEntity = new PurchaseEntity({
          purchaseId: await this.countersService.saveNextSequence(
            CounterType.PURCHASE_ID
          ),
          type: dto.type,

          user: user._id,
          userId: user.userId,

          transaction: transaction._id,
          transactionId: transaction.transactionId,

          days: dto.subscriptionDays,
        });

        const created = await this.purchasesRepository.create(
          newPurchaseEntity
        );

        await this.subscirptionsService.purchase(
          { userId: user.userId },
          { days: dto.subscriptionDays ?? 0 }
        );

        this.eventEmitter.emit(
          PurchaseEvents.CREATED,
          new PurchaseCreatedEvent(created.purchaseId)
        );

        user = await this.usersService.decBalance(
          { userId: user.userId },
          { dec: totalPrice }
        );
      }

      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при создании покупки';
      throw new InternalServerErrorException(message);
    }
  }

  async find(condition: FilterQuery<Purchase>): Promise<PurchaseEntity | null> {
    try {
      const purchase = await this.purchasesRepository.find(condition);

      return purchase;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске покупки';
      throw new InternalServerErrorException(message);
    }
  }

  async delete(
    condition: FilterQuery<Purchase>
  ): Promise<{ deleted: boolean }> {
    try {
      const result = await this.purchasesRepository.delete(condition);

      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при удалении покупки';
      throw new InternalServerErrorException(message);
    }
  }

  async populate(
    condition: FilterQuery<Purchase>
  ): Promise<PurchaseEntity | null> {
    try {
      const purchase = await this.purchasesRepository.populate(condition);

      return purchase;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске покупки';
      throw new InternalServerErrorException(message);
    }
  }
}
