// banner.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IWithdraw, WithdrawType } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Withdraw extends Document<Types.ObjectId> implements IWithdraw {
  @Prop({ type: Number, required: true })
  withdrawId!: number;

  @Prop({type: String, enum: WithdrawType, required: true})
  type!: WithdrawType;

  @Prop({ type: Number, required: false })
  userId?: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user?: Types.ObjectId;

  @Prop({ type: String, required: false })
  fundType?: string;


  @Prop({ type: String, required: true })
  toAddress!: string;

  @Prop({ type: Number, required: true })
  amount!: number;

  @Prop({ type: Date, default: new Date() })
  date!: Date;

  @Prop({ type: Boolean, default: true })
  needModeration!: boolean;
}

export const WithdrawSchema = SchemaFactory.createForClass(Withdraw);
