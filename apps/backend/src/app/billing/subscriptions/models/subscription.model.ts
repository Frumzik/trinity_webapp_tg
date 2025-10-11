import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ISubscription, IUser } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema()
export class Subscription extends Document<Types.ObjectId> implements ISubscription {
  @Prop({ type: Types.ObjectId, ref: 'User'})
  user?: Types.ObjectId | IUser;

  @Prop()
  userId?: number;

  @Prop({ required: true, unique: true })
  subscriptionId!: number;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
