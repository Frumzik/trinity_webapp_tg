import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ITraining } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema()
export class Training extends Document<Types.ObjectId> implements ITraining {
  @Prop({ required: true, unique: true })
  trainingId!: number;

  @Prop({ required: true })
  title!: string;
}

export const TrainingSchema = SchemaFactory.createForClass(Training);
