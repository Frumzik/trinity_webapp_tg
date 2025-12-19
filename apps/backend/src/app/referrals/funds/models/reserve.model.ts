import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IReserveFundItem, ReserveFundItemType } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class ReserveFundItem
  extends Document<Types.ObjectId>
  implements IReserveFundItem
{
  @Prop({ required: true })
  reserveId!: number;

  @Prop({ enum: ReserveFundItemType, type: String })
  type!: ReserveFundItemType;

  @Prop({ required: true })
  userId!: number;

  @Prop({ required: true })
  sum!: number;

  @Prop({ required: false })
  stage?: number;

  @Prop({ required: false })
  stageLevel?: number;

  @Prop({ required: false })
  trainingId?: number;

  @Prop({ required: false })
  referralId?: number;

  @Prop({ required: false })
  accepted?: boolean;

  @Prop({ type: Date, required: false, default: null })
  endDate!: Date | null;
}

export const ReserveFundItemSchema =
  SchemaFactory.createForClass(ReserveFundItem);
