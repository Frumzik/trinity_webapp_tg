import { Types } from 'mongoose';
import {
  ISubscription,
  SubscriptionType,
} from './subscription.interface.js';
import { IUser } from '../user/user.interface.js';
import { ApiProperty } from '@nestjs/swagger';

// subscription info
export class SubscriptionInfoResponseDto implements ISubscription {
  @ApiProperty({
    example: '653e2f9d5c1e43c3c2f8e8f4',
    description: 'Mongo ObjectId',
  })
  _id?: Types.ObjectId;

  @ApiProperty({ example: 101, description: 'ID подписки' })
  subscriptionId!: number;

  @ApiProperty({
    description: 'Пользователь, владелец подписки',
    type: () => Object, // Swagger не умеет рендерить mongoose refs напрямую
    nullable: true,
  })
  user!: Types.ObjectId | IUser | null;

  @ApiProperty({
    example: 42,
    description: 'ID пользователя (owner)',
    nullable: true,
  })
  userId!: number | null;

  @ApiProperty({
    enum: SubscriptionType,
    example: SubscriptionType.PREMIUM,
    description: 'Тип подписки (например, FREE, PREMIUM, TRIAL)',
  })
  type!: SubscriptionType;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: 'Дата начала подписки',
  })
  startDate!: Date;

  @ApiProperty({
    example: null,
    description: 'Дата окончания подписки (null = бессрочная)',
    nullable: true,
  })
  endDate!: Date | null;
}
