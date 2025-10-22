import { Document } from 'mongoose';
import { CounterType, ICounter } from '@trinity/shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Counter extends Document<string> implements ICounter {
  @Prop({ required: true, unique: true, enum: CounterType, type: String })
  type!: CounterType;

  @Prop({ required: true })
  seq!: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
