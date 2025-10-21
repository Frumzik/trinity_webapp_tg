import { ISubscription, IUser } from '@trinity/shared';
import { Types } from 'mongoose';
import { UserEntity } from '../../../account';

export class SubscriptionEntity implements ISubscription {
  _id?: Types.ObjectId;
  subscriptionId!: number;

  // Ссылки
  user: Types.ObjectId | IUser | null = null;
  userId: number | null = null;

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
