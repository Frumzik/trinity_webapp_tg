import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { Subscription, SubscriptionEntity } from '../../billing';
import { SubscriptionsRepository } from './repositories';
import { UserEntity } from '../../account';
import {
  CounterType,
  SubscriptionDaysLeftEvent,
  SubscriptionEvents,
  SubscriptionExpiredEvent,
  SubscriptionUpdatedEvent,
} from '@trinity/shared';
import { CountersService } from '../../service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly countersService: CountersService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async create(): Promise<SubscriptionEntity> {
    try {
      const newSubscription = new SubscriptionEntity({
        subscriptionId: await this.countersService.saveNextSequence(
          CounterType.SUBSCRIPTION_ID
        ),
      });

      return await this.subscriptionsRepository.create(newSubscription);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при создании подписки';
      throw new InternalServerErrorException(message);
    }
  }

  async find(
    condition: FilterQuery<Subscription>
  ): Promise<SubscriptionEntity | null> {
    try {
      const subscription = await this.subscriptionsRepository.find(condition);

      return subscription
        ? await this.subscriptionsRepository.update(subscription.validate())
        : null;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске подписки';
      throw new InternalServerErrorException(message);
    }
  }

  async delete(
    condition: FilterQuery<Subscription>
  ): Promise<{ deleted: boolean }> {
    try {
      const result = await this.subscriptionsRepository.delete(condition);

      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при удалении подписки';
      throw new InternalServerErrorException(message);
    }
  }

  async bindUser(
    subscription: SubscriptionEntity,
    user: UserEntity
  ): Promise<SubscriptionEntity> {
    try {
      const updated = await this.subscriptionsRepository.update(
        subscription.bindUser(user)
      );

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при привязке пользователя к подписке';
      throw new InternalServerErrorException(message);
    }
  }

  async populate(
    condition: FilterQuery<Subscription>
  ): Promise<SubscriptionEntity | null> {
    try {
      const subscription = await this.subscriptionsRepository.populate(
        condition
      );

      if (!subscription) {
        throw new NotFoundException('Подиска не найдена');
      }

      return await this.subscriptionsRepository.update(subscription.validate());
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске подписки';
      throw new InternalServerErrorException(message);
    }
  }

  async purchase(condition: FilterQuery<Subscription>, dto: { days: number }) {
    try {
      const subscription = await this.find(condition);

      if (!subscription) {
        throw new NotFoundException('Подписка не найдена');
      }

      const updated = await this.subscriptionsRepository.update(
        subscription.purchase(dto.days)
      );

      await this.eventEmitter.emit(
        SubscriptionEvents.UPDATED,
        new SubscriptionUpdatedEvent(updated.subscriptionId)
      );
      await this.eventEmitter.emit(
        SubscriptionEvents.PAYED,
        new SubscriptionExpiredEvent(subscription.subscriptionId)
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске подписки';
      throw new InternalServerErrorException(message);
    }
  }

  async checkAndUpdateAll() {
    const subscriptions = await this.subscriptionsRepository.findAll();

    const now = new Date();

    for (const subscription of subscriptions) {
      if (subscription.endDate) {
        const diffMs = subscription.endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        // осталось 3 дня
        if (diffDays == 3) {
          await this.eventEmitter.emit(
            SubscriptionEvents.DAYS_LEFT,
            new SubscriptionDaysLeftEvent(subscription.subscriptionId, diffDays)
          );
        } else if (subscription.endDate <= now) {
          await this.eventEmitter.emit(
            SubscriptionEvents.EXPIRED,
            new SubscriptionExpiredEvent(subscription.subscriptionId)
          );
        }
      }

      await this.subscriptionsRepository.update(subscription.validate());
    }
  }
}
