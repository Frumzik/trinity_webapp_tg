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

export interface IReserveFundItem {
  _id?: Types.ObjectId;
  userId: number;
  sum: number;
  stage: number;
  stageLevel: number;
  endDate: Date;
  isReturned: boolean;
}
