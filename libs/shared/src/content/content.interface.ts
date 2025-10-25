import { Types } from 'mongoose';

// Тренинги
export enum TrainingType {
  COURSE = 'course',
}

interface ITrainingBase {
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
  accessRules: IContentAccess[];
  price: number | null;
}

export interface ITrainingCourse extends ITrainingBase {
  type: TrainingType.COURSE;
}

export type ITraining = ITrainingCourse;

// Уроки
export enum LessonType {
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
}

interface ILessonBase {
  _id?: Types.ObjectId;

  lessonId: number;
  type: LessonType;

  // Вложенность
  parent: Types.ObjectId | ITraining | null;
  parentId: number | null;

  // Метаданные
  title: string | null;
  description: string | null;
  content: ILessonContent | null;

  // Условия доступности
  accessRules: IContentAccess[];
  price: number | null;
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

export interface ILessonVideo extends ILessonBase {
  type: LessonType.VIDEO;
  content: ILessonVideoContent;
}
export interface ILessonAudio extends ILessonBase {
  type: LessonType.AUDIO;
  content: ILessonAudioContent;
}

export interface ILessonText extends ILessonBase {
  type: LessonType.AUDIO;
  content: ILessonTextContent;
}

// export type ILesson = ILessonVideo | ILessonAudio | ILessonText;
export type ILesson = ILessonBase;

// Условия доступности
export enum ContentAccessType {
  SUBSCRIPTION = 'subscription',
  ONE_TIME_PAYMENT = 'one_time_payment',
  FREE = 'free',
  DATE_UNLOCK = 'date_unlock',
  TRAINING_COMPLETED = 'training_completed',
  LESSON_COMPLETED = 'lesson_completed',
}

interface IContentAccessBase {
  type: ContentAccessType;
  description?: string;
}

export interface IContentAccessSubscription extends IContentAccessBase {
  type: ContentAccessType.SUBSCRIPTION;
}

export interface IContentAccessOneTimePayment extends IContentAccessBase {
  type: ContentAccessType.ONE_TIME_PAYMENT;
}

export interface IContentAccessFree extends IContentAccessBase {
  type: ContentAccessType.FREE;
}

export interface IContentAccessDateUnlock extends IContentAccessBase {
  type: ContentAccessType.DATE_UNLOCK;
  value: Date;
}

export interface IContentAccessTrainingCompleted extends IContentAccessBase {
  type: ContentAccessType.TRAINING_COMPLETED;
  value: number;
}

export interface IContentAccessLessonCompleted extends IContentAccessBase {
  type: ContentAccessType.LESSON_COMPLETED;
  value: number;
}

export type IContentAccess =
  | IContentAccessSubscription
  | IContentAccessOneTimePayment
  | IContentAccessFree
  | IContentAccessDateUnlock
  | IContentAccessTrainingCompleted
  | IContentAccessLessonCompleted;
