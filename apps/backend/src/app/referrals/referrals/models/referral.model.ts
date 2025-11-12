import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser, IReferral } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Referral extends Document<Types.ObjectId> implements IReferral {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  partner!: Types.ObjectId | IUser;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  referral!: Types.ObjectId | IUser;

  @Prop({ type: Number, required: true })
  partnerId!: number;

  @Prop({ type: Number, required: true })
  referralId!: number;

  @Prop({ type: Number, required: true, min: 0 })
  earn!: number;

  @Prop({ type: Number, required: true, min: 0 })
  level!: number;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
