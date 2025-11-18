import { Document, Types } from 'mongoose';
import { IUser, UserGender, UserRole } from '@trinity/shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false, timestamps: true })
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

  @Prop({ type: Number })
  subscriptionId!: number | null;

  @Prop({ type: Number })
  height!: number | null;

  @Prop({ type: Number })
  weight!: number | null;

  @Prop({ type: Date })
  birthDate!: Date | null;

  @Prop({ enum: UserGender, type: String })
  gender!: UserGender | null;

  @Prop({ type: String })
  finPasswordHash!: string | null;

  @Prop({ type: String })
  address!: string | null;

  @Prop({ type: String, default: '' })
  referralPath!: string;

  @Prop({ type: String, default: '10:00' })
  meditationNotifications!: string;

  @Prop({ type: Boolean, default: true })
  contentNotifications!: boolean;

  @Prop({ type: Boolean, default: false })
  promoNotifications!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
