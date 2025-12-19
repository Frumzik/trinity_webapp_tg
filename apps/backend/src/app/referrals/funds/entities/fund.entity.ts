import { FundType, IFund } from '@trinity/shared';
import { Types } from 'mongoose';

export class FundEntity implements IFund {
  _id?: Types.ObjectId;

  title!: string;
  type!: FundType;

  balance = 0;
  earn = 0;

  constructor(fund: Partial<IFund>) {
    Object.assign(this, fund);
  }

  incBalance(sum: number) {
    this.balance += Math.round(Math.abs(sum) * 10) / 10;

    if (this.type !== FundType.RESERVE)
      this.earn += Math.round(Math.abs(sum) * 10) / 10;

    return this;
  }

  decBalance(sum: number) {
    this.balance -= Math.round(Math.abs(sum) * 10) / 10;

    return this;
  }
}
