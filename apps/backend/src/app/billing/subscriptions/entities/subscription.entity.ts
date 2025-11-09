import { ISubscription, IUser, SubscriptionType } from '@trinity/shared';
import { Types } from 'mongoose';
import { UserEntity } from '../../../account';

export class SubscriptionEntity implements ISubscription {
  _id?: Types.ObjectId;
  subscriptionId!: number;

  // Ссылки
  user: Types.ObjectId | IUser | null = null;
  userId: number | null = null;

  // Тип подписки
  type: SubscriptionType = SubscriptionType.FREE;

  // Сроки действия
  startDate: Date = new Date();
  endDate: Date | null = null;

  constructor(subscription: Partial<ISubscription> = {}) {
    Object.assign(this, subscription);
  }

  public bindUser(user: UserEntity) {
    if (!user._id) {
      throw new Error('Пользователь не имеет _id');
    }

    this.userId = user.userId;
    this.user = user._id;

    return this;
  }

  public isActive(): boolean {
    if (
      (this.type == SubscriptionType.PREMIUM ||
        this.type == SubscriptionType.TRIAL) &&
      this.endDate
        ? this.endDate > new Date()
        : true
    ) {
      return true;
    }
    return false;
  }

  public purchase(days: number) {
    const now = new Date();

    // Если подписка уже активна и премиум, продлеваем от endDate
    if (
      this.type === SubscriptionType.PREMIUM &&
      this.endDate &&
      this.endDate > now
    ) {
      this.endDate = new Date(
        this.endDate.getTime() + days * 24 * 60 * 60 * 1000
      );
    } else {
      // Новая подписка или просроченная — начинаем с сегодня
      this.startDate = now;
      this.endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }

    // Любая оплаченная подписка становится PREMIUM
    this.type = SubscriptionType.PREMIUM;

    return this;
  }

  public validate() {
    const now = new Date();

    if (this.endDate && this.endDate <= now) {
      this.type = SubscriptionType.FREE
      this.startDate = now;
      this.endDate = null;
    }

    return this;
  }
}
