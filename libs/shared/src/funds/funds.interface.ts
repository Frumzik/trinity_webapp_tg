import { Types } from 'mongoose';

export enum FundType {
  RESERVE = 'RESERVE',
  MAIN = 'MAIN',
  INVESTMENT = 'INVESTMENT',
}

export enum FundTitle {
  RESERVE = 'Резервный фонд',
  INVESTMENT = 'Фонд света',
  MAIN = 'Админский доход',
}

export interface IFund {
  _id?: Types.ObjectId;

  title: string;
  type: FundType;

  balance: number;
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
  accepted?: boolean;
  endDate: Date | null;
}
