import { Types } from 'mongoose';

export interface IWithdraw {
  _id?: Types.ObjectId;

  userId: number;

  toAddress: string;
  amount: number;

  date: Date;

  needModeration: boolean;
}

