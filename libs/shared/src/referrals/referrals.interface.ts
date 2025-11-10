import { Types } from 'mongoose';
import { IUser } from '../user/user.interface.js';

export interface IReferral {
  _id?: Types.ObjectId;

  partner: Types.ObjectId | IUser;
  referral: Types.ObjectId | IUser;

  partnerId: number;
  referralId: number;

  level: number;
  earn: number;
}
