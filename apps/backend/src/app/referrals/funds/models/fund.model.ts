import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IFund, FundType } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Fund extends Document<Types.ObjectId> implements IFund {
  @Prop({ enum: FundType, type: String, required: true })
  type!: FundType;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, default: 0 })
  balance!: number;

  @Prop({ required: true, default: 0 })
  earn!: number;
}

export const FundSchema = SchemaFactory.createForClass(Fund);
