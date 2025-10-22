import { Types } from 'mongoose';

export enum LearningAccessStatus {
  AVAILABLE = 'available',
  LOCKED = 'locked',
}
export enum LearningProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progess',
  COMPLETED = 'completed',
}

interface ILearningLesson {
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

  // Доступы и прогресс
  accessStatus: LearningAccessStatus;
  progressStatus: LearningProgressStatus;
}
