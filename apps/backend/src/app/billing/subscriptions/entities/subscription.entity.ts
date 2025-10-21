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
}
