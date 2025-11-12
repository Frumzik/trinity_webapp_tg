import { IsString, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { FundType } from './funds.interface.js';

export class FundCreateRequestDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(FundType)
  type!: FundType;
}

export class ReserveFundItemCreateRequestDto {
  @IsNumber()
  userId!: number;

  @IsNumber()
  sum!: number;

  @IsNumber()
  stage!: number;

  @IsNumber()
  stageLevel!: number;
}
