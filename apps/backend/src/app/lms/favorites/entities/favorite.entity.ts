import { FavoriteType, IFavorite, ILesson, ITraining } from '@trinity/shared';
import { Types } from 'mongoose';

export class FavoriteEntity implements IFavorite {
  _id?: Types.ObjectId;

  type!: FavoriteType;
  favoriteId!: number;
  userId!: number;

  trainingId!: number;
  lessonId!: number;

  training!: Types.ObjectId | ITraining;
  lesson!: Types.ObjectId | ILesson;

  constructor(favorite: IFavorite) {
    Object.assign(this, favorite);
  }
}
