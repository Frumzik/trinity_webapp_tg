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
    sum = Math.round(sum * 1000) / 1000;
    this.balance += sum;

    if (this.type !== FundType.RESERVE) this.earn += sum;

    return this;
  }

  decBalance(sum: number) {
    sum = Math.round(sum * 1000) / 1000;
    this.balance -= sum;

    return this;
  }
}
