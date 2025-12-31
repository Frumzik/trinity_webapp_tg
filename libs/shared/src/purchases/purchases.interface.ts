import { Types } from 'mongoose';
import { IUser } from '../user/user.interface.js';
import { ITransaction } from '../transactions/transactions.interface.js';

export enum PurchaseType {
  TRAINING = 'Training',
  PRACTISE = 'Practise',
  SUBSCRIPTION = 'Subscription',
  LESSON = 'Lesson',
}

export interface IPurchase {
  _id?: Types.ObjectId;
  purchaseId: number;
  type: PurchaseType;

  user: Types.ObjectId | IUser;
  userId: number;

  transaction: Types.ObjectId | ITransaction;
  transactionId: number;

  days?: number;
  contentId?: number;

  isGift?: boolean;
}
