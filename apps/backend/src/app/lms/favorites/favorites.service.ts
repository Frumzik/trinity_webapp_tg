import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { FavoritesRepository } from './repositories';
import { CounterType, FavoriteAddRequestDto } from '@trinity/shared';
import { CountersService } from '../../service';
import { FavoriteEntity } from './entities';
import { Favorite } from './models';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly favoritesRepository: FavoritesRepository,
    private readonly countersService: CountersService
  ) {}

  async create(dto: FavoriteAddRequestDto): Promise<FavoriteEntity> {
    try {
      const newFavorite = new FavoriteEntity({
        favoriteId: await this.countersService.saveNextSequence(
          CounterType.FAVORITE_ID
        ),
        ...dto,
      });

      return await this.favoritesRepository.create(newFavorite);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при создании избранного';
      throw new InternalServerErrorException(message);
    }
  }

  async find(condition: FilterQuery<Favorite>): Promise<FavoriteEntity | null> {
    try {
      const favorite = await this.favoritesRepository.find(condition);

      return favorite;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске избранного';
      throw new InternalServerErrorException(message);
    }
  }

  async findAll(condition: FilterQuery<Favorite>): Promise<FavoriteEntity[]> {
    try {
      const favorites = await this.favoritesRepository.findAll(condition);

      return favorites;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске избранного';
      throw new InternalServerErrorException(message);
    }
  }

  async delete(
    condition: FilterQuery<Favorite>
  ): Promise<{ deleted: boolean }> {
    try {
      const result = await this.favoritesRepository.delete(condition);

      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при удалении избранного';
      throw new InternalServerErrorException(message);
    }
  }

  async populate(condition: FilterQuery<Favorite>): Promise<FavoriteEntity[]> {
    try {
      const favorites = await this.favoritesRepository.populate(condition);

      return favorites;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске избранного';
      throw new InternalServerErrorException(message);
    }
  }
}
