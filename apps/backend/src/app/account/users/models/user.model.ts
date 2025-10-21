import { Document, Types } from 'mongoose';
import { IUser, UserRole } from '@trinity/shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User extends Document<Types.ObjectId> implements IUser {
  @Prop({ type: Types.ObjectId, ref: 'Subscription' })
  subscription!: Types.ObjectId | null;

  @Prop({ required: true, unique: true })
  userId!: number;

  @Prop()
  tgId!: number;

  @Prop({ type: String })
  pinHash!: string | null;

  @Prop({ type: String })
  email!: string | null;

  @Prop({ type: String })
  passwordHash!: string | null;

  @Prop({ enum: UserRole, type: String, default: UserRole.User })
  role!: UserRole;

  @Prop({ type: String })
  name!: string | null;

  @Prop({ type: String })
  username!: string | null;

  @Prop({ type: Number })
  balance!: number;

  @Prop({ type: String })
  subscriptionId!: number | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
