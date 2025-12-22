import { IReferral, IUser } from '@trinity/shared';
import { Types } from 'mongoose';

export class ReferralEntity implements IReferral {
  _id?: Types.ObjectId;

  partner!: Types.ObjectId | IUser;
  referral!: Types.ObjectId | IUser;

  partnerId!: number;
  referralId!: number;

  level!: number;
  earn = 0;

  constructor(referral: Partial<IReferral>) {
    Object.assign(this, referral);
  }

  incEarn(sum: number) {
    sum = Math.round(sum * 1000) / 1000;
    this.earn += sum;

    return this;
  }
}
