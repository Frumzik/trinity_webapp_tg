import { Types } from 'mongoose';
import { IUser } from '../user/user.interface.js';

export enum TransactionType {
  STANDART = 'Standart',
  REFERRAL = 'Referral',
  MERCHANT = 'Merchant',
  PURCHASE = 'Purchase',
  SUBSCRIPTION = 'Subscription',
  REPLENISHMENT = 'Replenishment',
  WITHDRAWAL = 'Withdrawal',
}
export interface ITransaction {
  _id?: Types.ObjectId;
  transactionId: number;
  user: Types.ObjectId | IUser;
  userId: number;
  type: TransactionType;
  sum: number;
  date: Date;
  description: string;
}
