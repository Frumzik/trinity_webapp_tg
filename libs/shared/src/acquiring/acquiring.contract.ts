import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';

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
  @IsInt()
  amount!: number;
}

export class AcquiringErrorWebhookDto {
  @IsString()
  @ApiProperty()
  message!: string;
}
