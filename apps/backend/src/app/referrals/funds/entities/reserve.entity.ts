import { IReserveFundItem } from '@trinity/shared';
import { Types } from 'mongoose';

export class ReserveFundItemEntity implements IReserveFundItem {
  _id?: Types.ObjectId;
  userId!: number;
  sum!: number;
  stage!: number;
  stageLevel!: number;
  endDate!: Date;
  isReturned = false;

  constructor(fundItem: Partial<IReserveFundItem>) {
    Object.assign(this, fundItem);
  }

  setIsReturned(status: boolean) {
    this.isReturned = status;

    return this;
  }
}
