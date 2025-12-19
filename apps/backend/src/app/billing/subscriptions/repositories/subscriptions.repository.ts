import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Subscription } from '../models';
import { SubscriptionEntity } from '../entities';
import { GetListOptions } from '@trinity/shared';

@Injectable()
export class SubscriptionsRepository {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<Subscription>
  ) {}

  // Создание подписки
  async create(
    subscriptionEntity: SubscriptionEntity
  ): Promise<SubscriptionEntity> {
    const created = await new this.subscriptionModel(subscriptionEntity).save();
    return new SubscriptionEntity(created.toObject());
  }

  // Поиск подписки
  async find(
    condition: FilterQuery<Subscription>
  ): Promise<SubscriptionEntity | null> {
    const subscription = await this.subscriptionModel.findOne(condition).exec();

    return subscription
      ? new SubscriptionEntity(subscription.toObject())
      : null;
  }

  // Поиск подписки
  async findAll(
    options?: GetListOptions<Subscription>
  ): Promise<SubscriptionEntity[]> {
    const {
      skip = 0,
      limit = 0,
      sort = {},
      filter = {},
      populate = [],
    } = options || {};

    const subscriptions = await this.subscriptionModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate.map((path) => ({ path })))
      .lean()
      .exec();

    return subscriptions.map((u) => new SubscriptionEntity(u));
  }

  // Подсчет подписок по условию
  async count(filter: FilterQuery<Subscription> = {}): Promise<number> {
    return await this.subscriptionModel.countDocuments(filter).exec();
  }

  // Обновление подписки
  async update(
    subscriptionEntity: SubscriptionEntity
  ): Promise<SubscriptionEntity> {
    if (!subscriptionEntity._id) {
      throw new Error('Подписка не имеет _id');
    }

    const updated = await this.subscriptionModel
      .findOneAndUpdate(
        { _id: subscriptionEntity._id },
        { $set: subscriptionEntity },
        { new: true } // вернуть обновлённый документ
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Подписка с id ${subscriptionEntity._id} не найдена`
      );
    }

    return new SubscriptionEntity(updated.toObject());
  }

  // Удаление подписки
  async delete(
    condition: FilterQuery<Subscription>
  ): Promise<{ deleted: boolean }> {
    const result = await this.subscriptionModel.deleteOne(condition).exec();

    return { deleted: result.deletedCount !== 0 };
  }

  // Получение с пользователем
  async populate(
    condition: FilterQuery<Subscription>
  ): Promise<SubscriptionEntity | null> {
    const subscription = await this.subscriptionModel
      .findOne(condition)
      .populate([
        {
          path: 'user',
        },
      ])
      .lean()
      .exec();

    return subscription ? new SubscriptionEntity(subscription) : null;
  }
}
