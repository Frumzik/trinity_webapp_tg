import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ISubscription, IUser } from '@trinity/shared';
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
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
