import { Types } from 'mongoose';
import { ISubscription, ISubscriptionPurchase, SubscriptionType } from './subscription.interface.js';
import { IUser } from '../user/user.interface.js';

// user
export class SubscriptionInfoResponseDto implements ISubscription {
  _id?: Types.ObjectId;
  subscriptionId!: number;

  // Ссылки
  user!: Types.ObjectId | IUser | null;
  userId!: number | null;

  // Тип подписки
  type!: SubscriptionType;

  // Сроки действия
  startDate!: Date;
  endDate!: Date | null; // null = бессрочная (например, free)

  // Покупки
  purchases!: ISubscriptionPurchase[];
}
