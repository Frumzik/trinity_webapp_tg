import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { SubscriptionEntity } from '../../billing';
import { Subscription } from 'rxjs';
import { SubscriptionsRepository } from './repositories';
import { UserEntity } from '../../account';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository
  ) {}

  async createSubscription(
    subscriptionEntity: SubscriptionEntity
  ): Promise<SubscriptionEntity> {
    try {
      return await this.subscriptionsRepository.createSubscription(
        subscriptionEntity
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при создании подписки';
      throw new InternalServerErrorException(message);
    }
  }

  async findSubscription(
    condition: FilterQuery<Subscription>
  ): Promise<SubscriptionEntity> {
    try {
      const subscription = await this.subscriptionsRepository.findSubscription(
        condition
      );
      if (!subscription) {
        throw new NotFoundException('Подписка не найдена');
      }
      return subscription;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске подписки';
      throw new InternalServerErrorException(message);
    }
  }

    async findSubscriptionAll(
    condition: FilterQuery<Subscription>
  ): Promise<SubscriptionEntity> {
    try {
      const subscription = await this.subscriptionsRepository.findSubscriptionAll(
        condition
      );
      if (!subscription) {
        throw new NotFoundException('Подписка не найдена');
      }
      return subscription;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске подписки';
      throw new InternalServerErrorException(message);
    }
  }

  async deleteSubscription(
    condition: FilterQuery<Subscription>
  ): Promise<{ deleted: boolean }> {
    try {
      const result = await this.subscriptionsRepository.deleteSubscription(
        condition
      );
      if (!result.deleted) {
        throw new NotFoundException('Подписка не найдена для удаления');
      }
      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при удалении подписки';
      throw new InternalServerErrorException(message);
    }
  }

  async bindUser(
    condition: FilterQuery<Subscription>,
    updateData: { user: UserEntity }
  ): Promise<SubscriptionEntity> {
    try {
      const updated = await this.subscriptionsRepository.bindUser(
        condition,
        updateData
      );

      if (!updated) {
        throw new NotFoundException('Подписка не найдена для обновления');
      }

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении подписки';
      throw new InternalServerErrorException(message);
    }
  }
}
