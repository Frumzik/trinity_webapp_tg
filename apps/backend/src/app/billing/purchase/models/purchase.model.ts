import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IPurchase, ITransaction, IUser, PurchaseType } from '@trinity/shared';

@Schema({ versionKey: false, timestamps: true })
export class Purchase extends Document<Types.ObjectId> implements IPurchase {
  @Prop({ required: true, unique: true })
  purchaseId!: number;

  @Prop({
    type: String,
    enum: PurchaseType,
    required: true,
  })
  type!: PurchaseType;

  // --- Ссылки ---
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId | IUser;

  @Prop({ required: true })
  userId!: number;

  @Prop({ type: Types.ObjectId, ref: 'Transaction', required: true })
  transaction!: Types.ObjectId | ITransaction;

  @Prop({ required: true })
  transactionId!: number;

  // --- Опциональные связи ---
  @Prop({ required: false })
  days?: number;

  @Prop({ required: false })
  contentId?: number;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
