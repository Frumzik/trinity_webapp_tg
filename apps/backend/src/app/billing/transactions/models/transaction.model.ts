import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser, TransactionType, ITransaction } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Transaction
  extends Document<Types.ObjectId>
  implements ITransaction
{
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId | IUser;

  @Prop({ type: Number, required: true })
  transactionId!: number;

  @Prop({ type: Number, required: true })
  userId!: number;

  @Prop({
    type: String,
    enum: TransactionType,
    required: true,
  })
  type!: TransactionType;

  @Prop({ type: Number, required: true, min: 0 })
  sum!: number;

  @Prop({ type: Date, required: true, default: Date.now() })
  date!: Date;

  @Prop({ type: String, required: true })
  description!: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
