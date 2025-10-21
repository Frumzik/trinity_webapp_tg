import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  type IContentAccess,
  ILesson,
  type ITraining,
  TrainingType,
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
    default: TrainingType.COURSE,
  })
  type!: TrainingType;

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
  coverUrl!: string | null;

  // Условия доступности
  @Prop({ type: Array, default: [] })
  accessRules!: IContentAccess[];

  @Prop({ type: Number, default: 0 })
  price!: number;
}

export const TrainingSchema = SchemaFactory.createForClass(Training);
