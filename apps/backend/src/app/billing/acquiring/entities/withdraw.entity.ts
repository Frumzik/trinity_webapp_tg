import { IUser, IWithdraw, WithdrawType } from '@trinity/shared';
import { Types } from 'mongoose';

export class WithdrawEntity implements IWithdraw {
  _id?: Types.ObjectId;

  withdrawId!: number;

  type!: WithdrawType;

  user?: Types.ObjectId | IUser;
  userId?: number;

  fundType?: string;

  toAddress!: string;
  amount!: number;

  date: Date = new Date();

  needModeration = false;

  constructor(withdraw: Partial<IWithdraw>) {
    Object.assign(this, withdraw);
  }

  update(data: Partial<Pick<IWithdraw, 'needModeration'>>) {
    if (data.needModeration !== undefined)
      this.needModeration = data.needModeration;

    return this;
  }
}
