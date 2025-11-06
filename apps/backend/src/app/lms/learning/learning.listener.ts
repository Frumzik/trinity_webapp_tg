// learning.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ContentEvents,
  LearningEvents,
  LessonAccessRulesUpdatedEvent,
  LessonCreatedEvent,
  LessonProgressStatusUpdatedEvent,
  SubscriptionEvents,
  SubscriptionUpdatedEvent,
  TrainingAccessRulesUpdatedEvent,
  TrainingCreatedEvent,
  UserEvents,
  UserRegisteredEvent,
} from '@trinity/shared';
import { LearningService } from './learning.service';
import { SubscriptionsService } from '../../billing';

@Injectable()
export class LearningListener {
  constructor(
    private readonly learningService: LearningService,
    private readonly subscriptionsService: SubscriptionsService
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

  

  @OnEvent(ContentEvents.LESSON_DELETED)
  async onLessonDeleted(payload: LessonCreatedEvent) {
    console.log(`✅ Урок ${payload.lessonId} удалён`);

    return await this.learningService.recalculateForTraining(
      payload.trainingId
    );
  }

  @OnEvent(LearningEvents.LESSON_PROGRESS_STATUS_UPDATED)
  async onLessonProgressStatusUpdated(payload: LessonProgressStatusUpdatedEvent) {
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
