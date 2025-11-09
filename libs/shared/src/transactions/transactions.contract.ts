import { IUser } from "../user/user.interface.js";
import { TransactionType } from "./transactions.interface.js";

export class TransactionCreateRequestDto {
  user!: IUser;
  type!: TransactionType;
  sum!: number;
  description!: string;
}
