import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ISubscription,
  IUser,
  SubscriptionType,
  SubscriptionPurchaseType,
  ISubscriptionPurchase,
} from '@trinity/shared';
import { Document, Types } from 'mongoose';
@Schema({ id: false })
export class SubscriptionPurchase
  extends Document
  implements ISubscriptionPurchase
{
  @Prop({
    type: String,
    enum: SubscriptionPurchaseType,
    required: true,
  })
  type!: SubscriptionPurchaseType;

  @Prop({
    required: true,
  })
  contentId!: number;
}

export const SubscriptionPurchaseSchema = SchemaFactory.createForClass(SubscriptionPurchase);


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

  @Prop({type: [SubscriptionPurchaseSchema], default: []})
  purchases!: ISubscriptionPurchase[];
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
