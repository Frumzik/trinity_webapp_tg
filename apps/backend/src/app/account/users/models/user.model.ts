import { Document } from 'mongoose';
import { IUser, UserRole } from '@trinity/shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User extends Document<string> implements IUser {
  @Prop()
  name!: string;

  @Prop({ required: true, unique: true })
  userId!: number;

  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: true, unique: true })
  tgId!: number;

  @Prop({ required: true })
  pinHash!: string;

  @Prop()
  email?: string;

  @Prop()
  passwordHash?: string;

  @Prop({ required: true, enum: UserRole, type: String })
  role!: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
