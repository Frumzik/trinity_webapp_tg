import { Types } from 'mongoose';
import { IUser } from '../user/user.interface.js';

export enum WithdrawType {
  USER = 'User',
  FUND = 'Fund'
}
export interface IWithdraw {
  _id?: Types.ObjectId;

  type: WithdrawType,
  withdrawId: number;

  user?: Types.ObjectId | IUser;
  userId?: number;

  fundType?: string;

  toAddress: string;
  amount: number;

  date: Date;

  needModeration: boolean;
}

