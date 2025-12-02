import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { WithdrawType } from './acquiring.interface.js';
import { FundType } from '../funds/funds.interface.js';

export class AcquiringWithdrawRequestDto {
  @IsString()
  @ApiProperty({ example: '0xadsf123r41dasdf' })
  address!: string;

  @IsString()
  @ApiProperty({ example: '10.5' })
  amount!: string;
}

export class AcquiringDepositWebhookDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  hash!: string;

  @ApiProperty()
  @IsString()
  toUserId!: string;

  @ApiProperty()
  @IsNumber()
  amount!: number;
}

export class AcquiringWithdrawWebhookDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  hash!: string;

  @ApiProperty()
  @IsString()
  fromAddress!: string;

  @ApiProperty()
  @IsString()
  toAddress!: string;

  @ApiProperty()
  @IsNumber()
  amount!: number;
}

export class AcquiringErrorWebhookDto {
  @IsString()
  @ApiProperty()
  message!: string;
}

export class WithdrawCreateRequestDto {
  @IsNumber()
  @ApiProperty()
  withdrawId!: number;
  
  @IsEnum(WithdrawType)
  @ApiProperty()
  type!: WithdrawType;
  
  @ApiPropertyOptional()
  user?: Types.ObjectId;

  @IsNumber()
  @ApiPropertyOptional()
  userId?: number;

  @IsEnum(FundType)
  @ApiProperty()
  fundType?: FundType;

  @IsString()
  @ApiProperty()
  toAddress!: string;

  @IsNumber()
  @ApiProperty()
  amount!: number;

  @IsBoolean()
  @ApiPropertyOptional()
  needModeration?: boolean;
}
