import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Favorite } from '../models';
import { FavoriteEntity } from '../entities';
import { GetListOptions } from '@trinity/shared';

@Injectable()
export class FavoritesRepository {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<Favorite>
  ) {}

  // Создание
  async create(favoriteEntity: FavoriteEntity): Promise<FavoriteEntity> {
    const created = await new this.favoriteModel(favoriteEntity).save();
    return new FavoriteEntity(created.toObject());
  }

  // Поиск
  async find(condition: FilterQuery<Favorite>): Promise<FavoriteEntity | null> {
    const favorite = await this.favoriteModel.findOne(condition).exec();

    return favorite ? new FavoriteEntity(favorite.toObject()) : null;
  }

  // Поиск избранного
  async findAll(options?: GetListOptions<Favorite>): Promise<FavoriteEntity[]> {
    const {
      skip = 0,
      limit = 0,
      sort = {},
      filter = {},
      populate = [],
    } = options || {};

    const favorites = await this.favoriteModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate.map((path) => ({ path })))
      .lean()
      .exec();

    return favorites.map((u) => new FavoriteEntity(u));
  }

  // Подсчет избранного по условию
  async count(filter: FilterQuery<Favorite> = {}): Promise<number> {
    return await this.favoriteModel.countDocuments(filter).exec();
  }

  // Обновление
  async update(favoriteEntity: FavoriteEntity): Promise<FavoriteEntity> {
    if (!favoriteEntity._id) {
      throw new Error('Избранное не имеет _id');
    }

    const updated = await this.favoriteModel
      .findOneAndUpdate(
        { _id: favoriteEntity._id },
        { $set: favoriteEntity },
        { new: true } // вернуть обновлённый документ
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Favorite с id ${favoriteEntity._id} не найден`
      );
    }

    return new FavoriteEntity(updated.toObject());
  }

  async delete(
    condition: FilterQuery<Favorite>
  ): Promise<{ deleted: boolean }> {
    const result = await this.favoriteModel.deleteOne(condition).exec();

    return { deleted: result.deletedCount !== 0 };
  }

  async populate(condition?: FilterQuery<Favorite>): Promise<FavoriteEntity[]> {
    // Загружаем все тренинги (с уроками)
    const allFavorites = await this.favoriteModel
      .find(condition ?? {})
      .populate([
        {
          path: 'lesson',
        },
        {
          path: 'training',
        },
      ])
      .lean()
      .exec();

    return allFavorites.map((r) => new FavoriteEntity(r));
  }
}
