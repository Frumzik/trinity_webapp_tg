import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ILesson, ITraining } from '@trinity/shared';

@Schema()
export class Lesson extends Document<Types.ObjectId> implements ILesson {
  @Prop({ required: true, unique: true })
  lessonId!: number;

  @Prop({ required: true })
  title!: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Training', default: null })
  parent?: Types.ObjectId | ITraining;

  @Prop({ type: Number, default: null })
  parentId!: number;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
