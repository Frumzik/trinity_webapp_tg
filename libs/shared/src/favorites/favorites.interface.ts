import { Types } from 'mongoose';
import { ILesson, ITraining } from '../content/content.interface.js';

export enum FavoriteType {
  TRAINING = 'Training',
  LESSON = 'Lesson',
}

export enum FavoritesTag {
  STANDART= 'standart',
  FILM = 'film',
  MUSIC = 'music',
  MEDITATION = 'meditation',
  BOOK = 'book',
  PRODUCT = 'product',
}

export enum FavoritesTagTitle {
  STANDART= 'Избранное',
  FILM = 'Фильмы',
  MUSIC = 'Музыка',
  MEDITATION = 'Медитации',
  PRODUCT = 'Продукты',
  BOOK = 'Книги',
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




export interface IFavoritesByTag {
  tag: FavoritesTag;
  title: FavoritesTagTitle;
  favorites: IFavorite[];
}
