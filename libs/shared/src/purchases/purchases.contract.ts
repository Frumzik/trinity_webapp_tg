import {
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { PurchaseType } from './purchases.interface.js';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseCreateRequestDto {
  @IsEnum(PurchaseType)
  @ApiProperty({ description: 'Тип покупки', enum: PurchaseType })
  type!: PurchaseType;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @ApiPropertyOptional({ description: 'ID контента', default: [] })
  content?: number[];

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Есть ли скидка', default: false })
  sale?: boolean;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Длительность подписки',
    default: undefined,
  })
  subscriptionDays?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Стоимость подписки',
    default: undefined,
  })
  subscriptionSum?: number;
}
