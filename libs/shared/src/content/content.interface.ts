import { Types } from 'mongoose';




// Тренинги
export enum TrainingType {
  COURSE = 'course',
}

interface ITrainingBase {
  trainingId: number;
  _id?: Types.ObjectId;

  title: string;
  description?: string;
  // type: TrainingType;
  coverUrl?: string;

  // Уроки, входящие в тренинг
  lessons?: Types.ObjectId[] | ILesson[];
  // Вложенные блоки (дочерние тренинги)
  childrens?: Types.ObjectId[] | ITraining[];
  // Ссылка на родителя (если есть)
  parent?: Types.ObjectId | ITraining | null;

  lessonsId: number[];
  childrensId: number[];
  parentId: number | null;
  isRoot: boolean;
  
  // accessRules?: IContentAccess[];
}

export interface ITrainingCourse extends ITrainingBase {
  type: TrainingType.COURSE;
}

// export type ITraining = ITrainingCourse;
export type ITraining = ITrainingBase;




// Уроки
export enum LessonType {
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
}

interface ILessonBase {
  lessonId: number;
  _id?: Types.ObjectId;
  title: string;
  description?: string;

  parent?: Types.ObjectId | ITraining;
  parentId: number;

  // type: LessonType
  // accessRules?: IContentAccess[];
}

export interface ILessonVideo extends ILessonBase {
  type: LessonType.VIDEO;
  content: {
    videoUrl: string;
    duration?: number;
    previewImage?: string;
  };
}
export interface ILessonAudio extends ILessonBase {
  type: LessonType.AUDIO;
  content: {
    audioUrl: string;
    duration?: number;
  };
}

export interface ILessonText extends ILessonBase {
  type: LessonType.AUDIO;
  content: {
    html: string;
  };
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
