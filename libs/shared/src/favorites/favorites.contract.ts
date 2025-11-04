import { Types } from 'mongoose';
import { FavoriteType, IFavorite } from './favorites.interface.js';
import { ILesson, ITraining } from '../content/content.interface.js';

export class FavoriteAddRequestDto implements Partial<IFavorite> {
  type!: FavoriteType;
  userId!: number;
  trainingId?: number;
  lessonId?: number;
}

export class FavoriteInfoResponseDto implements Partial<IFavorite> {
  _id?: Types.ObjectId;
  favoriteId!: number;
  userId!: number;

  type!: FavoriteType;
  trainingId?: number;
  lessonId?: number;

  training?: Types.ObjectId | ITraining;
  lesson?: Types.ObjectId | ILesson;
}
