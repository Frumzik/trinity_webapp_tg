import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  ILearning,
  ILearningLesson,
  ILesson,
  ITraining,
  IUser,
  LearningAccessStatus,
  LearningProgressStatus,
} from '@trinity/shared'; // или путь до твоего enum'а

// Подсхема для уроков
@Schema({ _id: false }) // чтобы не создавался отдельный _id для каждого урока
export class LearningLesson implements ILearningLesson {
  @Prop({ required: true })
  lessonId!: number;

  @Prop({ type: Types.ObjectId, ref: 'Lesson' })
  lesson!: Types.ObjectId | ILesson;

  @Prop({
    type: String,
    enum: Object.values(LearningAccessStatus),
    default: LearningAccessStatus.LOCKED,
  })
  accessStatus!: LearningAccessStatus;

  @Prop({
    type: String,
    enum: Object.values(LearningProgressStatus),
    default: LearningProgressStatus.NOT_STARTED,
  })
  progressStatus!: LearningProgressStatus;
}

const LearningLessonSchema = SchemaFactory.createForClass(LearningLesson);

@Schema({
  timestamps: true, // добавит createdAt / updatedAt
})
export class Learning extends Document<Types.ObjectId> implements ILearning {
  @Prop({ required: true })
  userId!: number;

  @Prop({ required: true })
  trainingId!: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user!: Types.ObjectId | IUser;

  @Prop({ type: Types.ObjectId, ref: 'Training' })
  training!: Types.ObjectId | ITraining;

  @Prop({
    type: String,
    enum: Object.values(LearningAccessStatus),
    default: LearningAccessStatus.LOCKED,
  })
  accessStatus!: LearningAccessStatus;

  @Prop({
    type: String,
    enum: Object.values(LearningProgressStatus),
    default: LearningProgressStatus.NOT_STARTED,
  })
  progressStatus!: LearningProgressStatus;

  @Prop({ type: [LearningLessonSchema], default: [] })
  lessons!: LearningLesson[];
}

export const LearningSchema = SchemaFactory.createForClass(Learning);

// Индексы для быстрого поиска
LearningSchema.index({ userId: 1, trainingId: 1 }, { unique: true });
LearningSchema.index({ 'lessons.lessonId': 1 });
