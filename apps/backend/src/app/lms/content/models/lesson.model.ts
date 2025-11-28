import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  type ILesson,
  type TypeContentAccess,
  type ILessonContent,
  LessonType,
  FavoritesTag,
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

  @Prop({
    type: String,
    required: true,
    enum: FavoritesTag,
    default: FavoritesTag.STANDART,
  })
  favoritesTag!: FavoritesTag;

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
  duration!: string | null;

  @Prop({ type: String, default: null })
  shortDescription!: string | null;

  @Prop({ type: String, default: null })
  coverUrl!: string | null;

  @Prop({ type: String, default: null })
  iconUrl!: string | null;

  @Prop({ type: String, default: null })
  bgUrl!: string | null;

  // Контент (в зависимости от типа урока)
  @Prop({ type: Object, default: { html: '' } })
  content!: ILessonContent;

  // Условия доступности
  @Prop({ type: Array, default: [] })
  accessRules!: TypeContentAccess[];

  @Prop({ type: Number, default: null })
  price!: number | null;

  @Prop({ type: Number, default: null })
  salePrice!: number | null;

  @Prop({ type: Boolean, default: false })
  deleted!: boolean;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
