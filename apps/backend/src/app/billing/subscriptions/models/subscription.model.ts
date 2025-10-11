import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ISubscription } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema()
export class Subscription extends Document<Types.ObjectId> implements ISubscription {
  @Prop({ type: Types.ObjectId, ref: 'User'})
  _userId?: Types.ObjectId;

  @Prop()
  userId?: number;

  @Prop({ required: true, unique: true })
  subscriptionId!: number;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
