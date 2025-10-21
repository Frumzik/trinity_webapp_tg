import { Types } from 'mongoose';
import { IUser } from '../user/user.interface.js';

export interface ISubscription {
  _id?: Types.ObjectId;
  subscriptionId: number;

  // Ссылки
  user: Types.ObjectId | IUser | null;
  userId: number | null;
}
