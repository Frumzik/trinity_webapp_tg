import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class AcquiringWithdrawRequestDto {
  @IsString()
  @ApiProperty({ example: '0xadsf123r41dasdf' })
  address!: string;

  @IsString()
  @ApiProperty({ example: '10.5' })
  amount!: string;
}



export class AcquiringDepositWebhookDto {
  id!: string;
  hash!: string;
  toUserId!: string;
  amount!: number;
}

export class AcquiringWithdrawWebhookDto {
  id!: string;
  hash!: string;
  fromAddress!: string;
  toAddress!: string;
  amount!: number;
}

export class AcquiringErrorWebhookDto {
  message!: string;
}
