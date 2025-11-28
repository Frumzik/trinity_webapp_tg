import { IUser, IWithdraw } from '@trinity/shared';
import { Types } from 'mongoose';

export class WithdrawEntity implements IWithdraw {
  _id?: Types.ObjectId;

  withdrawId!: number;

  user!: Types.ObjectId | IUser;
  userId!: number;

  toAddress!: string;
  amount!: number;

  date: Date = new Date();

  needModeration = true;

  constructor(withdraw: Partial<IWithdraw>) {
    Object.assign(this, withdraw);
  }

  update(data: Partial<Pick<IWithdraw, 'needModeration'>>) {
    if (data.needModeration !== undefined)
      this.needModeration = data.needModeration;

    return this;
  }
}
