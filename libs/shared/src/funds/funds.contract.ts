import { FundType } from "./funds.interface.js";

export class FundCreateRequestDto {
  title!: string;
  type!: FundType;
}

export class ReserveFundItemCreateRequestDto {
  userId!: number;
  sum!: number;
  stage!: number;
  stageLevel!: number;
  isReturned!: boolean;
}
