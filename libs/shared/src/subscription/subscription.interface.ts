import { Types } from 'mongoose';
import { IUser } from '../user/user.interface.js';

export enum SubscriptionType {
  FREE = 'free',
  TRIAL = 'trial',
  PREMIUM = 'premium'
}

export interface ISubscription {
  _id?: Types.ObjectId;
  subscriptionId: number;

  // Ссылки
  user: Types.ObjectId | IUser | null;
  userId: number | null;

  // Тип подписки
  type: SubscriptionType;

  // Сроки действия
  startDate: Date;
  endDate: Date | null; // null = бессрочная (например, free)
}
