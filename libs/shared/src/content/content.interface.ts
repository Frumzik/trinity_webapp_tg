import { Types } from 'mongoose';
import {
  LearningAccessStatus,
  LearningProgressStatus,
} from '../learning/learning.interface.js';

// Тренинги
export enum TrainingType {
  STANDART = 'standart',
  STAGES_SPIRIT = 'stages_spirit',
  STAGE_LEVEL = 'stage_level',
  STAGE = 'stage',
  SPIRITUAL_START = 'spiritual_start',
  ACADEMY_SPIRIT = 'acedemy_spirit',
  PRACTICE = 'practice',
  USEFUL_MATERIALS = 'userful_materials',
  KNOWLEDGE_WORKSHOP = 'knowledge_workshop',
  COURSE = 'course',
}

export enum FavoritesTag {
  STANDART= 'standart',
  FILMS = 'films',
  MUSIC = 'music',
  MEDITATION = 'meditation',
  PRODUCT = 'product',
}

export interface ITraining {
  _id?: Types.ObjectId;

  trainingId: number;
  type: TrainingType;
  favoritesTag: FavoritesTag;

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
  shortDescription: string | null;
  duration: string | null;
  coverUrl: string | null;
  iconUrl: string | null;

  // Условия доступности
  accessRules: TypeContentAccess[];
  price: number | null;
  salePrice: number | null;
  accessStatus?: LearningAccessStatus;
  progressStatus?: LearningProgressStatus;
}

export interface ITrainingCourse extends ITraining {
  type: TrainingType.STANDART;
}

export type TypeTraining = ITrainingCourse;

// Уроки
export enum LessonType {
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
  FILM = 'film',
}

export interface ILesson {
  _id?: Types.ObjectId;

  lessonId: number;
  type: LessonType;
  favoritesTag: FavoritesTag;

  // Вложенность
  parent: Types.ObjectId | ITraining | null;
  parentId: number | null;

  // Метаданные
  title: string | null;
  description: string | null;
  duration: string | null;
  coverUrl: string | null;
  bgUrl: string | null;
  content?: ILessonContent | null;

  // Условия доступности
  accessRules: TypeContentAccess[];
  price: number | null;
  salePrice: number | null;
  accessStatus?: LearningAccessStatus;
  progressStatus?: LearningProgressStatus;
}

export interface ILessonVideoContent {
  videoUrl: string;
}

export interface ILessonAudioContent {
  audioUrl: string;
}

export interface ILessonFilmContent {
  html: string;
}

export interface ILessonTextContent {
  html: string;
}

export type ILessonContent =
  | ILessonVideoContent
  | ILessonAudioContent
  | ILessonTextContent
  | ILessonFilmContent;

export interface ILessonVideo extends ILesson {
  type: LessonType.VIDEO;
  content: ILessonVideoContent;
}

export interface ILessonFilm extends ILesson {
  type: LessonType.FILM;
  content: ILessonFilmContent;
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

export interface TypeContentAccessTrainingCompleted
  extends TypeContentAccessBase {
  type: ContentAccessType.TRAINING_COMPLETED;
  value: number;
}

export interface TypeContentAccessLessonCompleted
  extends TypeContentAccessBase {
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
