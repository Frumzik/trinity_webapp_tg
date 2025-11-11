import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IReserveFundItem } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class ReserveFundItem
  extends Document<Types.ObjectId>
  implements IReserveFundItem
{
  @Prop({ required: true })
  userId!: number;

  @Prop({ required: true })
  sum!: number;

  @Prop({ required: true })
  stage!: number;

  @Prop({ required: true })
  stageLevel!: number;

  @Prop({ type: Date, required: true })
  endDate!: Date;

  @Prop({ type: Boolean, required: true })
  isReturned!: boolean;
}

export const ReserveFundItemSchema =
  SchemaFactory.createForClass(ReserveFundItem);
