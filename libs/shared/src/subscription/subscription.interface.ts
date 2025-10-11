import { Types } from 'mongoose';

export interface ISubscription {
  _id?: Types.ObjectId;
  _userId?: Types.ObjectId;
  userId?: number;
  subscriptionId: number;
}
