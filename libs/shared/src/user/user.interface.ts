import { Types } from 'mongoose';
import { ISubscription } from '../subscription/subscription.interface.js';

export enum UserRole {
  User = 'User',
  Moderator = 'Moderator',
  Admin = 'Admin',
}

export interface IUser {
  _id?: Types.ObjectId;
  _subscriptionId?: Types.ObjectId | ISubscription;
  userId: number;
  subscriptionId?: number;
  name?: string;
  username?: string;
  tgId?: number;
  pinHash?: string;
  email?: string;
  passwordHash?: string;
  role: UserRole;
  balance: number;
}
