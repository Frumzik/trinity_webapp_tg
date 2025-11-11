import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IFund, FundType } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Fund extends Document<Types.ObjectId> implements IFund {
  @Prop({ enum: FundType, type: String, required: true })
  type!: FundType;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: false })
  balance!: number;
}

export const FundSchema = SchemaFactory.createForClass(Fund);
