import { PurchaseType } from './purchases.interface.js';

export class PurchaseCreateRequestDto {
  type!: PurchaseType;
  content?: number[];
  sale?: boolean;

  subscriptionDays?: number;
  subscriptionSum?: number;
}
