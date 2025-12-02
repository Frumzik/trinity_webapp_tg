import { TransactionType } from "./transactions.interface.js";

export class TransactionCreateRequestDto {
  userId!: number;
  type!: TransactionType;
  sum!: number;
  description!: string;
  toAddress?: string;
}
