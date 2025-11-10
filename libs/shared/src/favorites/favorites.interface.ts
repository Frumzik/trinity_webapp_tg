import { Types } from 'mongoose';
import { ILesson, ITraining } from '../content/content.interface.js';

export enum FavoriteType {
  TRAINING = 'Training',
  LESSON = 'Lesson',
}

export enum FavoritesTag {
  STANDART= 'standart',
  FILMS = 'films',
  MUSIC = 'music',
  MEDITATION = 'meditation',
  PRODUCT = 'product',
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
