import { Types } from 'mongoose';
import {
  LearningAccessStatus,
  LearningProgressStatus,
} from '../learning/learning.interface.js';

// Тренинги
export enum TrainingType {
  COURSE = 'course',
}

export interface ITraining {
  _id?: Types.ObjectId;

  trainingId: number;
  type: TrainingType;

  // Вложенность
  lessons: Types.ObjectId[] | ILesson[];
  childrens: Types.ObjectId[] | ITraining[];
  parent: Types.ObjectId | ITraining | null;

  lessonsId: number[];
  childrensId: number[];
  parentId: number | null;

  // Метаданные
  title: string | null;
  description: string | null;
  coverUrl: string | null;

  // Условия доступности
  accessRules: TypeContentAccess[];
  price: number | null;
  accessStatus?: LearningAccessStatus;
  progressStatus?: LearningProgressStatus;
}

export interface ITrainingCourse extends ITraining {
  type: TrainingType.COURSE;
}

export type TypeTraining = ITrainingCourse;

// Уроки
export enum LessonType {
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
}

export interface ILesson {
  _id?: Types.ObjectId;

  lessonId: number;
  type: LessonType;

  // Вложенность
  parent: Types.ObjectId | ITraining | null;
  parentId: number | null;

  // Метаданные
  title: string | null;
  description: string | null;
  coverUrl: string | null;
  content?: ILessonContent | null;

  // Условия доступности
  accessRules: TypeContentAccess[];
  price: number | null;
  accessStatus?: LearningAccessStatus;
  progressStatus?: LearningProgressStatus;
}

export interface ILessonVideoContent {
  videoUrl: string;
  duration?: number;
}

export interface ILessonAudioContent {
  audioUrl: string;
  duration?: number;
}

export interface ILessonTextContent {
  html: string;
}

export type ILessonContent =
  | ILessonVideoContent
  | ILessonAudioContent
  | ILessonTextContent;

export interface ILessonVideo extends ILesson {
  type: LessonType.VIDEO;
  content: ILessonVideoContent;
}
export interface ILessonAudio extends ILesson {
  type: LessonType.AUDIO;
  content: ILessonAudioContent;
}

export interface ILessonText extends ILesson {
  type: LessonType.AUDIO;
  content: ILessonTextContent;
}

export type TypeLesson = ILessonVideo | ILessonAudio | ILessonText;

// Условия доступности
export enum ContentAccessType {
  SUBSCRIPTION = 'subscription',
  ONE_TIME_PAYMENT = 'one_time_payment',
  FREE = 'free',
  DATE_UNLOCK = 'date_unlock',
  TRAINING_COMPLETED = 'training_completed',
  LESSON_COMPLETED = 'lesson_completed',
}

interface TypeContentAccessBase {
  type: ContentAccessType;
  description?: string;
}

export interface TypeContentAccessSubscription extends TypeContentAccessBase {
  type: ContentAccessType.SUBSCRIPTION;
}

export interface TypeContentAccessOneTimePayment extends TypeContentAccessBase {
  type: ContentAccessType.ONE_TIME_PAYMENT;
}

export interface TypeContentAccessFree extends TypeContentAccessBase {
  type: ContentAccessType.FREE;
}

export interface TypeContentAccessDateUnlock extends TypeContentAccessBase {
  type: ContentAccessType.DATE_UNLOCK;
  value: Date;
}

export interface TypeContentAccessTrainingCompleted extends TypeContentAccessBase {
  type: ContentAccessType.TRAINING_COMPLETED;
  value: number;
}

export interface TypeContentAccessLessonCompleted extends TypeContentAccessBase {
  type: ContentAccessType.LESSON_COMPLETED;
  value: number;
}

export type TypeContentAccess =
  | TypeContentAccessSubscription
  | TypeContentAccessOneTimePayment
  | TypeContentAccessFree
  | TypeContentAccessDateUnlock
  | TypeContentAccessTrainingCompleted
  | TypeContentAccessLessonCompleted;
