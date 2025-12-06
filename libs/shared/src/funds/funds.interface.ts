import { Types } from 'mongoose';

export enum FundType {
  RESERVE = 'RESERVE',
  MAIN = 'MAIN',
  ADMIN = 'ADMIN',
}

export enum FundTitle {
  RESERVE = 'Резервный фонд',
  ADMIN = 'Фонд ТРИНИТИ',
  MAIN = 'Фонд света',
}

export interface IFund {
  _id?: Types.ObjectId;

  title: string;
  type: FundType;

  balance: number;
  earn: number;
}

export enum ReserveFundItemType {
  STAGE = 'Stage',
  SUBSCRIPTION = 'Subscription',
  PRACTISE = 'Practise',
}

export interface IReserveFundItem {
  _id?: Types.ObjectId;
  reserveId: number;
  type: ReserveFundItemType;
  userId: number;
  sum: number;
  stage?: number;
  stageLevel?: number;
  trainingId?: number;
  referralId?: number;
  accepted?: boolean;
  endDate: Date | null;
}
