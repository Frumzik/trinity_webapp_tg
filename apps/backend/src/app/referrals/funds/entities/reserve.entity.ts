import { IReserveFundItem, ReserveFundItemType } from '@trinity/shared';
import { Types } from 'mongoose';

export class ReserveFundItemEntity implements IReserveFundItem {
  _id?: Types.ObjectId;
  reserveId!: number;
  type!: ReserveFundItemType;
  userId!: number;
  sum!: number;
  stage?: number;
  stageLevel?: number;
  trainingId?: number;
  accepted?: boolean;
  referralId?: number;
  endDate: Date | null = null;

  constructor(fundItem: Partial<IReserveFundItem>) {
    Object.assign(this, fundItem);
  }

  accept() {
    this.accepted = true;

    return this;
  }
}
