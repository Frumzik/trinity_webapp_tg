import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ISubscription, IUser, SubscriptionType } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Subscription
  extends Document<Types.ObjectId>
  implements ISubscription
{
  @Prop({ required: true, unique: true })
  subscriptionId!: number;

  // Ссылки
  @Prop({ default: null })
  userId!: number;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  user!: Types.ObjectId | IUser;

  // Тип подписки
  @Prop({
    type: String,
    enum: SubscriptionType,
    required: true,
    default: SubscriptionType.FREE,
  })
  type!: SubscriptionType;

  // Сроки действия
  @Prop({ type: Date, default: new Date() })
  startDate!: Date;

  @Prop({ type: Date, default: null })
  endDate!: Date | null;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
