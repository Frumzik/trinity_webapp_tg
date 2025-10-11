import { Document, Types } from 'mongoose';
import { IUser, UserRole } from '@trinity/shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User extends Document<Types.ObjectId> implements IUser {
  @Prop({ type: Types.ObjectId, ref: 'Subscription' })
  _subscriptionId?: Types.ObjectId;

  @Prop({ required: true, unique: true })
  userId!: number;

  @Prop({ unique: true, sparse: true })
  tgId?: number;

  @Prop()
  pinHash?: string;

  @Prop({ unique: true, sparse: true })
  email?: string;

  @Prop()
  passwordHash?: string;

  @Prop({ required: true, enum: UserRole, type: String })
  role!: UserRole;

  @Prop()
  name?: string;

  @Prop()
  username?: string;

  @Prop({ required: true })
  balance!: number;

  @Prop()
  subscriptionId?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
