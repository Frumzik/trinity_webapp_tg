import { Types } from 'mongoose';
import { IUser } from '../user/user.interface.js';

export interface ISubscription {
  _id?: Types.ObjectId;
  user?: Types.ObjectId | IUser;
  userId?: number;
  subscriptionId: number;
}
