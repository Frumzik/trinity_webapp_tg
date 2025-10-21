import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  type ILesson,
  type IContentAccess,
  type ILessonContent,
  LessonType,
} from '@trinity/shared';

@Schema({ versionKey: false, timestamps: true })
export class Lesson extends Document<Types.ObjectId> implements ILesson {
  @Prop({ required: true, unique: true })
  lessonId!: number;

  @Prop({
    type: String,
    required: true,
    enum: LessonType,
    default: LessonType.TEXT,
  })
  type!: LessonType;

  // Вложенность
  @Prop({ type: Types.ObjectId, ref: 'Training', default: null })
  parent!: Types.ObjectId | null;

  @Prop({ type: Number, default: null })
  parentId!: number | null;

  // Метаданные
  @Prop({ type: String, default: null })
  title!: string | null;

  @Prop({ type: String, default: null })
  description!: string | null;

  @Prop({ type: String, default: null })
  coverUrl!: string | null;

  // Контент (в зависимости от типа урока)
  @Prop({ type: Object, default: { html: '' } })
  content!: ILessonContent;

  // Условия доступности
  @Prop({ type: Array, default: [] })
  accessRules!: IContentAccess[];

  @Prop({ type: Number, default: 0 })
  price!: number;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
