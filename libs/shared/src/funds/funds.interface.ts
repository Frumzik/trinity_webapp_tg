import { Types } from 'mongoose';

export enum FundType {
  RESERVE = 'RESERVE',
  MAIN = 'MAIN',
}

export enum FundTitle {
  RESERVE = 'Резервный фонд',
  MAIN = 'Фонд Света'
}

export interface IFund {
  _id?: Types.ObjectId;

  title: string;
  type: FundType;

  balance: number;
}

export enum ReserveFundItemType {
  STAGE = "Stage",
  SUBSCRIPTION = "Subscription",
  PRACTISE = "Practise"
}

export interface IReserveFundItem {
  _id?: Types.ObjectId;
  type: ReserveFundItemType,
  userId: number;
  sum: number;
  stage?: number;
  stageLevel?: number;
  trainingId?: number;
  endDate: Date | null;
}
