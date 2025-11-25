import { IWithdraw } from '@trinity/shared';
import { Types } from 'mongoose';

export class WithdrawEntity implements IWithdraw {
  _id?: Types.ObjectId;

  userId!: number;

  toAddress!: string;
  amount!: number;

  date: Date = new Date();

  needModeration = true;

  constructor(withdraw: Partial<IWithdraw>) {
    Object.assign(this, withdraw);
  }
}
