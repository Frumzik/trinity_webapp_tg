import { Document } from 'mongoose';
import { IUser, UserRole } from '@trinity/shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User extends Document<string> implements IUser {
  @Prop()
  displayName!: string;

  @Prop({ required: true })
  tgId!: number;

  @Prop({ required: true })
  pinHash!: string;

  @Prop()
  email?: string;

  @Prop()
  passwordHas?: string;

  @Prop({ required: true, enum: UserRole, type: String })
  role!: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User)
