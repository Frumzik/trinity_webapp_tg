// learning.listener.ts
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ContentEvents,
  LearningEvents,
  LessonAccessRulesUpdatedEvent,
  LessonCreatedEvent,
  LessonProgressStatusUpdatedEvent,
  PurchaseCreatedEvent,
  PurchaseEvents,
  PurchaseType,
  SubscriptionEvents,
  SubscriptionUpdatedEvent,
  TrainingAccessRulesUpdatedEvent,
  TrainingCreatedEvent,
  UserEvents,
  UserRegisteredEvent,
} from '@trinity/shared';
import { LearningService } from './learning.service';
import { PurchaseService, SubscriptionsService } from '../../billing';
import { UsersService } from '../../account';
import { ContentService } from '../content';

@Injectable()
export class LearningListener {
  constructor(
    private readonly learningService: LearningService,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly subscriptionsService: SubscriptionsService,
    @Inject(forwardRef(() => ContentService))
    private readonly contentService: ContentService,
    @Inject(forwardRef(() => PurchaseService))
    private readonly purchaseService: PurchaseService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService
  ) {}

  @OnEvent(ContentEvents.TRAINING_CREATED)
  async onTrainingCreated(payload: TrainingCreatedEvent) {
    console.log(`✅ Тренинг ${payload.trainingId} создан`);

    return await this.learningService.recalculateForTraining(
      payload.trainingId
    );
  }

  @OnEvent(ContentEvents.TRAINING_DELETED)
  async onTrainingDeleted({ trainingId }: TrainingCreatedEvent) {
    console.log(`✅ Тренинг ${trainingId} удалён`);

    return await this.learningService.delete({ trainingId });
  }

  @OnEvent(ContentEvents.TRAINING_ACCESS_RULES_UPDATED)
  async onTrainingAccessRulesUpdated(payload: TrainingAccessRulesUpdatedEvent) {
    console.log(`✅ Тренинг ${payload.trainingId} обновлен`);

    return await this.learningService.recalculateForTraining(
      payload.trainingId
    );
  }

  @OnEvent(ContentEvents.LESSON_CREATED)
  async onLessonCreated(payload: LessonCreatedEvent) {
    console.log(`✅ Урок ${payload.lessonId} создан`);

    return await this.learningService.recalculateForTraining(
      payload.trainingId
    );
  }

  @OnEvent(PurchaseEvents.CREATED)
  async onPurchaseCreated({ purchaseId }: PurchaseCreatedEvent) {
    console.log(`✅ Покупка ${purchaseId} создана`);

    const purchase = await this.purchaseService.populate({ purchaseId });

    if (!purchase) {
      throw new NotFoundException('Покупка не найдена');
    }

    const user = await this.usersService.find({ userId: purchase.userId });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    switch (purchase.type) {
      case PurchaseType.TRAINING: {
        const training = await this.contentService.findTraining({
          trainingId: purchase.contentId,
        });

        if (!training) {
          throw new NotFoundException('Тренинг не найден');
        }
        return await this.learningService.recalculateTrainingForUser(
          training,
          user
        );
      }
      case PurchaseType.LESSON: {
        const lesson = await this.contentService.findLesson({
          lessonId: purchase.contentId,
        });

        if (!lesson) {
          throw new NotFoundException('Урок не найден');
        }

        const training = await this.contentService.findTraining({
          trainingId: lesson.parentId,
        });

        if (!training) {
          throw new NotFoundException('Тренинг не найден');
        }

        return await this.learningService.recalculateTrainingForUser(
          training,
          user
        );
      }
      case PurchaseType.SUBSCRIPTION: {
        return await this.learningService.recalculateForUser(purchase.userId);
      }

      default: {
        return await this.learningService.recalculateForUser(purchase.userId);
      }
    }
  }

  @OnEvent(ContentEvents.LESSON_DELETED)
  async onLessonDeleted(payload: LessonCreatedEvent) {
    console.log(`✅ Урок ${payload.lessonId} удалён`);

    return await this.learningService.recalculateForTraining(
      payload.trainingId
    );
  }

  @OnEvent(LearningEvents.LESSON_PROGRESS_STATUS_UPDATED)
  async onLessonProgressStatusUpdated(
    payload: LessonProgressStatusUpdatedEvent
  ) {
    return await this.learningService.recalculateForTraining(
      payload.trainingId
    );
  }

  @OnEvent(ContentEvents.LESSON_ACCESS_RULES_UPDATED)
  async onLessonAccessReluesUpdated(payload: LessonAccessRulesUpdatedEvent) {
    console.log(`✅ Урок ${payload.lessonId} обновлен`);

    return await this.learningService.recalculateForTraining(
      payload.trainingId
    );
  }

  @OnEvent(UserEvents.REGISTERED)
  async onUserChanged(payload: UserRegisteredEvent) {
    console.log(`✅ Пользователь ${payload.userId} создан`);

    return await this.learningService.recalculateForUser(payload.userId);
  }

  @OnEvent(SubscriptionEvents.UPDATED)
  async onSubscriptionChanged(payload: SubscriptionUpdatedEvent) {
    const subscirption = await this.subscriptionsService.find({
      subscriptionId: payload.subscriptionId,
    });

    if (!subscirption) {
      return;
    }

    console.log(`✅ Подписка ${payload.subscriptionId} обновлена`);

    return await this.learningService.recalculateForUser(
      subscirption.userId as number
    );
  }
}
