import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  type TypeContentAccess,
  ILesson,
  type ITraining,
  TrainingType,
  FavoritesTag,
  TrainingTag,
} from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Training extends Document<Types.ObjectId> implements ITraining {
  @Prop({ required: true, unique: true })
  trainingId!: number;

  @Prop({
    type: String,
    required: true,
    enum: TrainingType,
    default: TrainingType.TRAINING,
  })
  type!: TrainingType;

  @Prop({
    type: String,
    required: true,
    enum: FavoritesTag,
    default: FavoritesTag.STANDART,
  })
  favoritesTag!: FavoritesTag;

  @Prop({
    type: String,
    required: true,
    enum: TrainingTag,
    default: TrainingTag.STANDART,
  })
  tag!: TrainingTag;

  // Наставник
  @Prop({ type: Number, default: null })
  merchantId!: number | null;

  // Если ступень
  @Prop({ type: Number, required: false })
  stage?: number;

  @Prop({ type: Number, required: false })
  stageLevel?: number;

  // Вложенность
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Lesson' }], default: [] })
  lessons!: Types.ObjectId[] | ILesson[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Training' }], default: [] })
  childrens!: Types.ObjectId[] | ITraining[];

  @Prop({ type: Types.ObjectId, ref: 'Training', default: null })
  parent!: Types.ObjectId | null;

  @Prop({ type: [Number], default: [] })
  lessonsId!: number[];

  @Prop({ type: [Number], default: [] })
  childrensId!: number[];

  @Prop({ type: Number, default: null })
  parentId!: number | null;

  // Метаданные
  @Prop({ type: String, default: null })
  title!: string | null;

  @Prop({ type: String, default: null })
  description!: string | null;

  @Prop({ type: String, default: null })
  shortDescription!: string | null;

  @Prop({ type: String, default: null })
  duration!: string | null;

  @Prop({ type: String, default: null })
  coverUrl!: string | null;

  @Prop({ type: String, default: null })
  bgUrl!: string | null;

  @Prop({ type: String, default: null })
  iconUrl!: string | null;

  // Условия доступности
  @Prop({ type: Array, default: [] })
  accessRules!: TypeContentAccess[];

  @Prop({ type: Number, default: 0 })
  price!: number;

  @Prop({ type: Number, default: null })
  salePrice!: number | null;
}

export const TrainingSchema = SchemaFactory.createForClass(Training);
