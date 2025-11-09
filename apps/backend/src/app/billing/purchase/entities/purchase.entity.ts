import { IPurchase, ITransaction, IUser, PurchaseType } from '@trinity/shared';
import { Types } from 'mongoose';

export class PurchaseEntity implements IPurchase {
  _id?: Types.ObjectId;
  purchaseId!: number;
  type!: PurchaseType;

  user!: Types.ObjectId | IUser;
  userId!: number;

  transaction!: Types.ObjectId | ITransaction;
  transactionId!: number;

  days?: number;
  contentId?: number;

  constructor(purchase: Partial<IPurchase>) {
    Object.assign(this, purchase);
  }
}
