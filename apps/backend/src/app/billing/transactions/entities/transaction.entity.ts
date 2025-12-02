import {
  ITransaction,
  IUser,
  TransactionType,
} from '@trinity/shared';
import { Types } from 'mongoose';

export class TransactionEntity implements ITransaction {
  _id?: Types.ObjectId;
  transactionId!: number;
  user!: Types.ObjectId | IUser;
  userId!: number;
  type: TransactionType = TransactionType.STANDART;
  sum = 0;
  date: Date = new Date();
  description = '';
  toAddress?: string;

  constructor(transaction: Partial<ITransaction>) {
    Object.assign(this, transaction);
    this.sum = Math.round(this.sum * 10) / 10;
  }
}
