import { Types } from 'mongoose';
import { IUser } from '../user/user.interface.js';
import { ILesson, ITraining } from '../content/content.interface.js';

export enum LearningAccessStatus {
  AVAILABLE = 'available',
  LOCKED = 'locked',
}
export enum LearningProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface ILearningLesson {
  lesson: Types.ObjectId | ILesson;
  lessonId: number;
  accessStatus: LearningAccessStatus;
  progressStatus: LearningProgressStatus;
}
export interface ILearning {
  _id?: Types.ObjectId;

  // Ссылки
  userId: number;
  trainingId: number;
  lessons: ILearningLesson[];

  user: Types.ObjectId | IUser;
  training: Types.ObjectId | ITraining;

  // Доступы и прогресс
  accessStatus: LearningAccessStatus;
  progressStatus: LearningProgressStatus;
}
