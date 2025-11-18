import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class AcquiringWithdrawRequestDto {
  @IsString()
  @ApiProperty({ example: '0xadsf123r41dasdf' })
  address!: string;

  @IsString()
  @ApiProperty({ example: '10.5' })
  amount!: string;
}

export class AcquiringDepositWebhookDto {
  @IsString()
  id!: string;

  @IsString()
  hash!: string;

  @IsString()
  toUserId!: string;

  @IsInt()
  amount!: number;
}

export class AcquiringWithdrawWebhookDto {
  @IsString()
  id!: string;

  @IsString()
  hash!: string;

  @IsString()
  fromAddress!: string;

  @IsString()
  toAddress!: string;

  @IsInt()
  amount!: number;
}

export class AcquiringErrorWebhookDto {
  @IsString()
  message!: string;
}
