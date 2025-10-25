import {
  ISubscription,
  ISubscriptionPurchase,
  IUser,
  SubscriptionType,
} from '@trinity/shared';
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

  // Покупки
  purchases: ISubscriptionPurchase[] = [];

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

  public addPurchase(purchase: ISubscriptionPurchase) {
    this.purchases.push(purchase);

    return this;
  }

  public hasPurchase(purchase: ISubscriptionPurchase) {
    return this.purchases.some(
      (p) => p.type == purchase.type && p.contentId == purchase.contentId
    );
  }

  public isActive(): boolean {
    if (
      (this.type == SubscriptionType.PAID ||
        this.type == SubscriptionType.TRIAL) &&
      this.endDate
        ? this.endDate > new Date()
        : true
    ) {
      return true;
    }
    return false;
  }
}
