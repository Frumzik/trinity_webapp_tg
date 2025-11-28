import { Types } from 'mongoose';
import { ISubscription } from '../subscription/subscription.interface.js';

export enum UserRole {
  User = 'User',
  Moderator = 'Moderator',
  Admin = 'Admin',
}

export enum UserGender {
  MALE = 'Male',
  FEMALE = 'Female',
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

  finPasswordHash: string | null;
  address: string | null;

  // Метаинформация
  name: string | null;
  username: string | null;
  birthDate: Date | null;
  height: number | null;
  weight: number | null;
  gender: UserGender | null;

  // Other
  role: UserRole;
  balance: number;

  meditationNotifications: string;
  contentNotifications: boolean;
  promoNotifications: boolean;

  deleted: boolean;

  // Рефералка
  referralPath: string;
}
