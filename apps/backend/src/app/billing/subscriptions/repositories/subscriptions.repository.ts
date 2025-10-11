import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Subscription } from '../models/subscription.model';
import { FilterQuery, Model } from 'mongoose';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { UserEntity } from '../../../account';

@Injectable()
export class SubscriptionsRepository {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<Subscription>
  ) {}

  // Создание подписки
  async createSubscription(
    subscriptionEntity: SubscriptionEntity
  ): Promise<SubscriptionEntity> {
    const newSubscription = new this.subscriptionModel(subscriptionEntity);
    const saved = await newSubscription.save();

    return new SubscriptionEntity(saved);
  }

  // Поиск подписки
  async findSubscription(
    condition: FilterQuery<Subscription>
  ): Promise<SubscriptionEntity | null> {
    const subscription = await this.subscriptionModel.findOne(condition).exec();
    return subscription ? new SubscriptionEntity(subscription) : null;
  }

   // Поиск подписки
  async findSubscriptionAll(
    condition: FilterQuery<Subscription>
  ): Promise<SubscriptionEntity | null> {
    const subscription = await this.subscriptionModel.findOne(condition).populate("user").exec();
    return subscription ? new SubscriptionEntity(subscription) : null;
  }

  // Удаление подписки
  async deleteSubscription(
    condition: FilterQuery<Subscription>
  ): Promise<{ deleted: boolean }> {
    const result = await this.subscriptionModel.deleteOne(condition).exec();
    return { deleted: result.deletedCount > 0 };
  }

  // Обновление подписки
  async bindUser(
    condition: FilterQuery<Subscription>,
    update: {user: UserEntity}
  ): Promise<SubscriptionEntity | null> {
    const subscription = await this.subscriptionModel.findOne(condition).exec();
    if (!subscription) return null;

    // Применяем изменения через SubscriptionEntity
    const subscriptionEntity = new SubscriptionEntity(subscription);
    await subscriptionEntity.bindUser(update.user); // если есть async методы внутри

    const updated = await this.subscriptionModel
      .findOneAndUpdate(condition, subscriptionEntity, { new: true })
      .exec();

    return updated ? new SubscriptionEntity(updated) : null;
  }
}
