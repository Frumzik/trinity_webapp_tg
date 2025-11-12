import { IsEnum, IsOptional, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { PurchaseType } from './purchases.interface.js';

export class PurchaseCreateRequestDto {
  @IsEnum(PurchaseType)
  type!: PurchaseType;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  content?: number[];

  @IsOptional()
  @IsBoolean()
  sale?: boolean;

  @IsOptional()
  @IsNumber()
  subscriptionDays?: number;

  @IsOptional()
  @IsNumber()
  subscriptionSum?: number;
}
