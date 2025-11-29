import { Types } from 'mongoose';
import { IUser } from '../user/user.interface.js';

export interface IWithdraw {
  _id?: Types.ObjectId;

  withdrawId: number;

  user: Types.ObjectId | IUser;
  userId: number;

  toAddress: string;
  amount: number;

  date: Date;

  needModeration: boolean;
}

