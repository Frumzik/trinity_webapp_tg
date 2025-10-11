import { ISubscription, IUser } from '@trinity/shared';
import { Types } from 'mongoose';
import { UserEntity } from '../../../account';

export class SubscriptionEntity implements ISubscription {
  _id?: Types.ObjectId;
  user?: Types.ObjectId | IUser;
  userId?: number;
  subscriptionId!: number;

  constructor(subscription: ISubscription) {
    this._id = subscription._id;
    this.user = subscription.user;
    this.userId = subscription.userId;
    this.subscriptionId = subscription.subscriptionId;
  }

  public bindUser(user: UserEntity) {
    this.userId = user.userId;
    this.user = user._id;
  }
}
