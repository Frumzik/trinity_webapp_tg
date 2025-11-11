import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { FavoritesRepository } from './repositories';
import {
  CounterType,
  FavoriteAddRequestDto,
  FavoritesTag,
  FavoritesTagTitle,
  FavoriteType,
  IFavorite,
  IFavoritesByTag,
} from '@trinity/shared';
import { CountersService } from '../../service';
import { FavoriteEntity } from './entities';
import { Favorite } from './models';
import { ContentService } from '../content';
import { UsersService } from '../../account';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly favoritesRepository: FavoritesRepository,
    private readonly countersService: CountersService,
    private readonly contentService: ContentService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService
  ) {}

  async create(
    userId: number,
    dto: FavoriteAddRequestDto
  ): Promise<FavoriteEntity> {
    try {
      const user = await this.usersService.find({ userId });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      let existingFavorite = null;
      let training_id = undefined;
      let lesson_id = undefined;

      switch (dto.type) {
        case FavoriteType.TRAINING: {
          existingFavorite = await this.find({
            userId,
            trainingId: dto.trainingId,
          });

          const training = await this.contentService.findTraining({
            trainingId: dto.trainingId,
          });

          if (!training) {
            throw new NotFoundException('Тренинг не найден');
          }

          training_id = training._id;

          break;
        }

        case FavoriteType.LESSON: {
          existingFavorite = await this.find({
            userId,
            lessonId: dto.lessonId,
          });

          const lesson = await this.contentService.findLesson({
            lessonId: dto.lessonId,
          });

          if (!lesson) {
            throw new NotFoundException('Урок не найден');
          }

          lesson_id = lesson._id;

          break;
        }
      }

      if (existingFavorite) {
        throw new Error('Избранное уже добавлено');
      }
      const newFavorite = new FavoriteEntity({
        favoriteId: await this.countersService.saveNextSequence(
          CounterType.FAVORITE_ID
        ),
        ...dto,
        userId,
        lesson: lesson_id,
        training: training_id
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

  groupFavoritesByTag(favorites: IFavorite[]): IFavoritesByTag[] {
    const grouped: Record<FavoritesTag, IFavorite[]> = {} as Record<
      FavoritesTag,
      IFavorite[]
    >;

    for (const fav of favorites) {
      let tag: FavoritesTag | undefined;

      // Проверяем, что training это объект, а не ObjectId
      if (
        fav.training &&
        typeof fav.training === 'object' &&
        'favoritesTag' in fav.training
      ) {
        tag = fav.training.favoritesTag as FavoritesTag;
      } else if (
        fav.lesson &&
        typeof fav.lesson === 'object' &&
        'favoritesTag' in fav.lesson
      ) {
        tag = fav.lesson.favoritesTag as FavoritesTag;
      }

      if (!tag) continue;

      if (!grouped[tag]) grouped[tag] = [];
      grouped[tag].push(fav);
    }

    return Object.entries(grouped).map(([tag, favs]) => ({
      tag: tag as FavoritesTag,
      title:
        FavoritesTagTitle[tag.toUpperCase() as keyof typeof FavoritesTagTitle],
      favorites: favs,
    }));
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
