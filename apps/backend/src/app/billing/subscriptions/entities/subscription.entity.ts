import { ISubscription } from '@trinity/shared';
import { Types } from 'mongoose';
import { UserEntity } from '../../../account';

export class SubscriptionEntity implements ISubscription {
  _id?: Types.ObjectId;
  _userId?: Types.ObjectId;
  userId?: number;
  subscriptionId!: number;

  constructor(subscription: ISubscription) {
    this._id = subscription._id;
    this._userId = subscription._userId;
    this.userId = subscription.userId;
    this.subscriptionId = subscription.subscriptionId;
  }

  public updateSubscription(data: Partial<SubscriptionEntity>) {
    // Обновляем все свойства динамически
    Object.assign(this, data);
    return this;
  }

  public bindUser(user: UserEntity) {
    this.userId = user.userId;
    this._userId = user._id;
  }
}
