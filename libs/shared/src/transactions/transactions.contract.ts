import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { FundType } from '../funds/funds.interface.js';
import { TransactionType } from './transactions.interface.js';

export class TransactionCreateRequestDto {
  @IsNumber()
  userId!: number;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsOptional()
  @IsEnum(FundType)
  fundType?: FundType;

  @IsNumber()
  sum!: number;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  toAddress?: string;
}
