import {
  IsString,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsDate,
} from 'class-validator';
import { FundType, ReserveFundItemType } from './funds.interface.js';
import { Type } from 'class-transformer';

export class FundCreateRequestDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(FundType)
  type!: FundType;
}

export class ReserveFundItemCreateRequestDto {
  @IsEnum(ReserveFundItemType)
  type!: ReserveFundItemType;

  @IsNumber()
  userId!: number;

  @IsNumber()
  sum!: number;

  @IsNumber()
  @IsOptional()
  stage?: number;

  @IsNumber()
  @IsOptional()
  stageLevel?: number;

  @IsNumber()
  @IsOptional()
  accepted?: boolean;

  @IsNumber()
  @IsOptional()
  trainingId?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date | null;
}
