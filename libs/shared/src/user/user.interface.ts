import { Types } from 'mongoose';
import { ISubscription } from '../subscription/subscription.interface.js';

export enum UserRole {
  User = 'User',
  Moderator = 'Moderator',
  Admin = 'Admin',
}

export interface IUser {
  _id?: Types.ObjectId;
  userId: number;

  // Ссылки
  subscription: Types.ObjectId | ISubscription | null;
  subscriptionId: number | null;

  // Credentials
  tgId: number | null;
  pinHash: string | null;
  email: string | null;
  passwordHash: string | null;

  // Метаинформация
  name: string | null;
  username: string | null;

  // Other
  role: UserRole;
  balance: number;
}
