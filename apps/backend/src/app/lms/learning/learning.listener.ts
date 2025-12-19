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
  SubscriptionEvents,
  SubscriptionExpiredEvent,
  TrainingAccessRulesUpdatedEvent,
  TrainingCreatedEvent,
  TrainingProgressStatusUpdatedEvent,
  UserEvents,
  UserRegisteredEvent,
} from '@trinity/shared';
import { LearningService } from './learning.service';
import { PurchaseService, SubscriptionsService } from '../../billing';

@Injectable()
export class LearningListener {
  constructor(
    private readonly learningService: LearningService,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly subscriptionsService: SubscriptionsService,
    @Inject(forwardRef(() => PurchaseService))
    private readonly purchaseService: PurchaseService
  ) {}

  @OnEvent(ContentEvents.TRAINING_CREATED)
  async onTrainingCreated(payload: TrainingCreatedEvent) {
    return await this.learningService.recalculateForTraining(
      payload.trainingId
    );
  }

  @OnEvent(ContentEvents.TRAINING_DELETED)
  async onTrainingDeleted({ trainingId }: TrainingCreatedEvent) {
    return await this.learningService.delete({ trainingId });
  }

  @OnEvent(LearningEvents.TRAINING_PROGRESS_STATUS_UPDATED)
  async onTrainingProgressStatusUpdated(
    payload: TrainingProgressStatusUpdatedEvent
  ) {
    return await this.learningService.recalculateForUser(payload.userId);
  }

  @OnEvent(ContentEvents.TRAINING_ACCESS_RULES_UPDATED)
  async onTrainingAccessRulesUpdated(payload: TrainingAccessRulesUpdatedEvent) {
    return await this.learningService.recalculateForTraining(
      payload.trainingId
    );
  }

  @OnEvent(PurchaseEvents.CREATED)
  async onPurchaseCreated({ purchaseId }: PurchaseCreatedEvent) {
    const purchase = await this.purchaseService.populate({ purchaseId });

    if (!purchase) {
      throw new NotFoundException('Покупка не найдена');
    }

    return await this.learningService.recalculateForUser(purchase.userId);
  }

  @OnEvent(ContentEvents.LESSON_CREATED)
  async onLessonCreated(payload: LessonCreatedEvent) {
    return await this.learningService.recalculateForTraining(
      payload.trainingId
    );
  }

  @OnEvent(ContentEvents.LESSON_DELETED)
  async onLessonDeleted(payload: LessonCreatedEvent) {
    return await this.learningService.recalculateForTraining(
      payload.trainingId
    );
  }

  @OnEvent(LearningEvents.LESSON_PROGRESS_STATUS_UPDATED)
  async onLessonProgressStatusUpdated(
    payload: LessonProgressStatusUpdatedEvent
  ) {
    return await this.learningService.recalculateForUser(payload.userId);
  }

  @OnEvent(ContentEvents.LESSON_ACCESS_RULES_UPDATED)
  async onLessonAccessReluesUpdated(payload: LessonAccessRulesUpdatedEvent) {
    return await this.learningService.recalculateForTraining(
      payload.trainingId
    );
  }

  @OnEvent(UserEvents.REGISTERED)
  async onUserChanged(payload: UserRegisteredEvent) {
    return await this.learningService.recalculateForUser(payload.userId);
  }

  @OnEvent(SubscriptionEvents.EXPIRED)
  async onSubscriptionChanged(payload: SubscriptionExpiredEvent) {
    const subscirption = await this.subscriptionsService.find({
      subscriptionId: payload.subscriptionId,
    });

    if (!subscirption) {
      return;
    }

    return await this.learningService.recalculateForUser(
      subscirption.userId as number
    );
  }
}
