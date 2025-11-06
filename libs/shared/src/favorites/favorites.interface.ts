import { Types } from 'mongoose';
import { ILesson, ITraining } from '../content/content.interface.js';

export enum FavoriteType {
  TRAINING = 'Training',
  LESSON = 'Lesson',
}
export interface IFavorite {
  _id?: Types.ObjectId;
  favoriteId: number;
  userId: number;

  type: FavoriteType;
  trainingId?: number;
  lessonId?: number;

  training?: Types.ObjectId | ITraining;
  lesson?: Types.ObjectId | ILesson;
}
