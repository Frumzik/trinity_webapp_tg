import {
  BadRequestException,
  ConflictException,
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
  ContentAccessType,
  CounterType,
  GetListOptions,
  PurchaseCreatedEvent,
  PurchaseCreateRequestDto,
  PurchaseEvents,
  PurchaseType,
  ReserveFundItemType,
  TransactionType,
  TypeContentAccess,
} from '@trinity/shared';
import { CountersService, formatDays } from '../../service';
import { UserEntity, UsersService } from '../../account';
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
      const user = await this.usersService.find({ userId });
      if (!user) throw new NotFoundException('Пользователь не найден');

      // Проверка на существующие покупки
      await this.validateExistingPurchases(user, dto);

      // Проверка контента + расчет суммы
      const totalPrice = await this.validateContentAndCalcTotalPrice(dto);

      // Проверка баланса
      if (user.balance < totalPrice) {
        throw new ConflictException('Недостаточно ОМ на балансе');
      }

      // Проверка условий покупки
      await this.validateAccessRules(user, dto);

      // Обработка по типу
      switch (dto.type) {
        case PurchaseType.PRACTISE:
          await this.handlePractisePurchase(user, dto);
          break;

        case PurchaseType.TRAINING:
          await this.handleTrainingPurchase(user, dto);
          break;

        case PurchaseType.LESSON:
          await this.handleLessonPurchase(user, dto);
          break;

        case PurchaseType.SUBSCRIPTION:
          await this.handleSubscriptionPurchase(user, dto);
          break;
      }

      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при создании покупки';
      throw new InternalServerErrorException(message);
    }
  }

  // -------------------------------------------------------------------------
  //  VALIDATION FUNCTIONS
  // -------------------------------------------------------------------------

  private async validateExistingPurchases(
    user: UserEntity,
    dto: PurchaseCreateRequestDto
  ) {
    if (
      dto.type === PurchaseType.LESSON ||
      dto.type === PurchaseType.TRAINING
    ) {
      for (const contentId of dto.content ?? []) {
        const exist = await this.find({
          type: dto.type,
          contentId,
          userId: user.userId,
        });
        if (exist) {
          throw new Error('Покупка уже существует');
        }
      }
    }
  }

  private async validateAccessRules(
    user: UserEntity,
    dto: PurchaseCreateRequestDto
  ) {
    for (const contentId of dto.content ?? []) {
      let accessRules: TypeContentAccess[] = [];

      switch (dto.type) {
        case PurchaseType.PRACTISE:
        case PurchaseType.TRAINING: {
          const training = await this.contentService.findTraining({
            trainingId: contentId,
          });
          if (!training) {
            throw new NotFoundException('Тренинг не найден');
          }

          accessRules = training.accessRules;
          break;
        }
        case PurchaseType.LESSON: {
          const lesson = await this.contentService.findLesson({
            lessonId: contentId,
          });
          if (!lesson) {
            throw new NotFoundException('Урок не найден');
          }

          accessRules = lesson.accessRules;
          break;
        }
      }

      for (const rule of accessRules) {
        console.log(rule.type);
        switch (rule.type) {
          case ContentAccessType.SUBSCRIPTION: {
            const subscription = await this.subscirptionsService.find({
              userId: user.userId,
            });

            if (!subscription) {
              throw new NotFoundException('Подписка не найдена');
            }

            if (!subscription.isActive()) {
              throw new Error(rule.description ?? 'Сначала оформите подписку');
            }
            break;
          }
          case ContentAccessType.TRAINING_PURCHASED: {
            if (dto.content?.includes(rule.value)) {
              break;
            }

            const purchase = await this.find({
              type: PurchaseType.TRAINING,
              userId: user.userId,
              contentId: rule.value,
            });

            console.log(rule);

            if (!purchase) {
              throw new Error(
                rule.description ?? 'Не куплены предыдущие тренинги'
              );
            }
            break;
          }
        }
      }
    }
  }

  private async validateContentAndCalcTotalPrice(
    dto: PurchaseCreateRequestDto
  ): Promise<number> {
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

    return totalPrice;
  }

  // -------------------------------------------------------------------------
  //  PURCHASE HANDLERS
  // -------------------------------------------------------------------------

  private async handlePractisePurchase(
    user: UserEntity,
    dto: PurchaseCreateRequestDto
  ) {
    for (const contentId of dto.content ?? []) {
      const training = await this.contentService.findTraining({
        trainingId: contentId,
      });
      if (!training) throw new NotFoundException('Тренинг не найден');

      const reserveItem = await this.fundsService.findReserveItem({
        type: ReserveFundItemType.PRACTISE,
        userId: user.userId,
        trainingId: training.trainingId,
      });

      if (reserveItem) {
        throw new Error('Заявка на практику уже создана');
      }

      const price =
        dto.sale && training.salePrice
          ? training.salePrice ?? 0
          : training.price ?? 0;

      const transaction = await this.transactionsService.create({
        type: TransactionType.PURCHASE,
        userId: user.userId,
        sum: -price,
        description: `Вы приобрели практику "${training.title}" за ${price} OM.\nВ ближайшее время мастер свяжется с вами для согласования времени проведения практики.\nБлагодарим за доверие.`,
      });

      if (!transaction) throw new Error('Ошибка создания транзакции');

      const purchaseId = await this.countersService.saveNextSequence(
        CounterType.PURCHASE_ID
      );

      const purchase = new PurchaseEntity({
        purchaseId,
        type: PurchaseType.PRACTISE,
        user: user._id,
        userId: user.userId,
        transaction: transaction._id,
        transactionId: transaction.transactionId,
        contentId,
      });

      await this.purchasesRepository.create(purchase);

      await this.fundsService.createReserveItem({
        type: ReserveFundItemType.PRACTISE,
        trainingId: training.trainingId,
        sum: price,
        userId: user.userId,
        accepted: false,
      });

      await this.notificationsService.sendBotNewPractise(user, training);

      this.eventEmitter.emit(
        PurchaseEvents.CREATED,
        new PurchaseCreatedEvent(purchaseId)
      );

      // списание баланса
      user = await this.usersService.decBalance(
        { userId: user.userId },
        { dec: price }
      );
    }
  }

  private async handleTrainingPurchase(
    user: UserEntity,
    dto: PurchaseCreateRequestDto
  ) {
    for (const contentId of dto.content ?? []) {
      const training = await this.contentService.findTraining({
        trainingId: contentId,
      });
      if (!training) throw new NotFoundException('Тренинг не найден');

      const price =
        dto.sale && training.salePrice
          ? training.salePrice ?? 0
          : training.price ?? 0;

      const transaction = await this.transactionsService.create({
        type: TransactionType.PURCHASE,
        userId: user.userId,
        sum: -price,
        description: training.stage
          ? `Поздравляем! Вы открыли ${training.stage} Ступень Духа ${training.stageLevel} уровня`
          : `Поздравляем! Вы приобрели ${training.title}.\nБлагодарим за доверие.`,
      });

      if (!transaction) throw new Error('Ошибка создания транзакции');

      const purchaseId = await this.countersService.saveNextSequence(
        CounterType.PURCHASE_ID
      );

      const purchase = new PurchaseEntity({
        purchaseId,
        type: PurchaseType.TRAINING,
        user: user._id,
        userId: user.userId,
        transaction: transaction._id,
        transactionId: transaction.transactionId,
        contentId,
      });

      await this.purchasesRepository.create(purchase);

      this.eventEmitter.emit(
        PurchaseEvents.CREATED,
        new PurchaseCreatedEvent(purchaseId)
      );

      user = await this.usersService.decBalance(
        { userId: user.userId },
        { dec: price }
      );
    }
  }

  private async handleLessonPurchase(
    user: UserEntity,
    dto: PurchaseCreateRequestDto
  ) {
    for (const contentId of dto.content ?? []) {
      const lesson = await this.contentService.findLesson({
        lessonId: contentId,
      });
      if (!lesson) throw new NotFoundException('Урок не найден');

      const price =
        dto.sale && lesson.salePrice
          ? lesson.salePrice ?? 0
          : lesson.price ?? 0;

      const transaction = await this.transactionsService.create({
        type: TransactionType.PURCHASE,
        userId: user.userId,
        sum: -price,
        description: `Покупка урока ${lesson.title}`,
      });

      if (!transaction) throw new Error('Ошибка создания транзакции');

      const purchaseId = await this.countersService.saveNextSequence(
        CounterType.PURCHASE_ID
      );

      const purchase = new PurchaseEntity({
        purchaseId,
        type: PurchaseType.LESSON,
        user: user._id,
        userId: user.userId,
        transaction: transaction._id,
        transactionId: transaction.transactionId,
        contentId,
      });

      await this.purchasesRepository.create(purchase);

      this.eventEmitter.emit(
        PurchaseEvents.CREATED,
        new PurchaseCreatedEvent(purchaseId)
      );

      user = await this.usersService.decBalance(
        { userId: user.userId },
        { dec: price }
      );
    }
  }

  private async handleSubscriptionPurchase(
    user: UserEntity,
    dto: PurchaseCreateRequestDto
  ) {
    const totalPrice = dto.subscriptionSum ?? 0;

    const transaction = await this.transactionsService.create({
      type: TransactionType.SUBSCRIPTION,
      userId: user.userId,
      sum: -totalPrice,
      description: `Доступ к приложению активирован на ${
        dto.subscriptionDays == 365
          ? '1 год'
          : `${dto.subscriptionDays} ${formatDays(
              dto.subscriptionDays as number
            )}`
      }`,
    });

    if (!transaction) throw new Error('Ошибка создания транзакции');

    const purchaseId = await this.countersService.saveNextSequence(
      CounterType.PURCHASE_ID
    );

    const purchase = new PurchaseEntity({
      purchaseId,
      type: PurchaseType.SUBSCRIPTION,
      user: user._id,
      userId: user.userId,
      transaction: transaction._id,
      transactionId: transaction.transactionId,
      days: dto.subscriptionDays,
    });

    await this.purchasesRepository.create(purchase);

    await this.subscirptionsService.purchase(
      { userId: user.userId },
      { days: dto.subscriptionDays ?? 0 }
    );

    this.eventEmitter.emit(
      PurchaseEvents.CREATED,
      new PurchaseCreatedEvent(purchaseId)
    );

    user = await this.usersService.decBalance(
      { userId: user.userId },
      { dec: totalPrice }
    );
  }

  // -------------------------------------------------------------------------
  //  OTHERS
  // -------------------------------------------------------------------------
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

  async findAll(options?: GetListOptions<Purchase>): Promise<PurchaseEntity[]> {
    try {
      const purchases = await this.purchasesRepository.findAll(options);

      return purchases;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске покупки';
      throw new InternalServerErrorException(message);
    }
  }

  async count(condition: FilterQuery<Purchase>): Promise<number> {
    try {
      const count = await this.purchasesRepository.count(condition);

      return count;
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
