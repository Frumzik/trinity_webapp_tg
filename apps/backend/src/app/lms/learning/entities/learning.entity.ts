import {
  ILearning,
  ILearningLesson,
  ITraining,
  IUser,
  LearningAccessStatus,
  LearningProgressStatus,
} from '@trinity/shared';
import { Types } from 'mongoose';

export class LearningEntity implements ILearning {
  _id?: Types.ObjectId;

  // Ссылки
  userId!: number;
  trainingId!: number;
  lessons: ILearningLesson[] = [];

  training!: Types.ObjectId | ITraining;
  user!: Types.ObjectId | IUser;

  // Доступы и прогресс
  accessStatus!: LearningAccessStatus;
  progressStatus!: LearningProgressStatus;

  constructor(learning: ILearning) {
    Object.assign(this, learning);
  }

  updateAccessStatus(status: LearningAccessStatus) {
    this.accessStatus = status;

    return this;
  }

  updateProgressStatus(status: LearningProgressStatus) {
    this.progressStatus = status;

    return this;
  }

  updateLessonAccessStatus(lessonId: number, status: LearningAccessStatus) {
    const lesson = this.lessons.find((l) => l.lessonId === lessonId);

    if (lesson) {
      lesson.accessStatus = status;
    }

    return this;
  }

  updateLessonProgressStatus(lessonId: number, status: LearningProgressStatus) {
    const lesson = this.lessons.find((l) => l.lessonId === lessonId);

    if (lesson) {
      lesson.progressStatus = status;
    }

    const lessonStatuses = this.lessons.map((l) => l.progressStatus);

    const hasInProgress = lessonStatuses.includes(
      LearningProgressStatus.IN_PROGRESS
    );
    const hasCompleted = lessonStatuses.includes(
      LearningProgressStatus.COMPLETED
    );
    const allCompleted =
      lessonStatuses.length > 0 &&
      lessonStatuses.every((s) => s === LearningProgressStatus.COMPLETED);

    if (hasInProgress || (hasCompleted && !allCompleted)) {
      this.progressStatus = LearningProgressStatus.IN_PROGRESS;
    } else if (allCompleted) {
      this.progressStatus = LearningProgressStatus.COMPLETED;
    }

    return this;
  }

  addLesson(lesson: ILearningLesson) {
    const exists = this.lessons.some((l) => l.lessonId === lesson.lessonId);
    if (!exists) {
      this.lessons.push(lesson);
    }
    return this;
  }

  removeLesson(lessonId: number) {
    this.lessons = this.lessons.filter((l) => l.lessonId !== lessonId);
    return this;
  }
}
