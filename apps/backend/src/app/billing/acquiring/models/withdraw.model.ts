// banner.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IWithdraw } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Withdraw extends Document<Types.ObjectId> implements IWithdraw {
  @Prop({ type: Number, required: true })
  userId!: number;

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
