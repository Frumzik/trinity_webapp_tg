/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ContentAddTrainingRequestDto, GetListOptions } from '@trinity/shared';
import { ContentService } from '../../lms';
import { Training } from '../../lms/content/models';
import { LessonEntity, TrainingEntity } from '../../lms/content/entities';

@Injectable()
export class AdminTrainingService {
  constructor(private readonly contentService: ContentService) {}
  /**
   * LIST: фильтры + сортировка + пагинация
   */
  async getList(params: GetListOptions<Training>) {
    try {
      // Параметры для findAll
      const options = {
        ...params,
        filter: {
          ...params.filter,
        },
        populate: ['childrens', 'lessons'], // если нужно populate
      };

      const items = await this.contentService.findAllTrainings(options);
      const total = await this.contentService.countTrainings();

      return {
        items: items.map((u) => ({
          ...u,
          id: u.trainingId,
          lessons: u.lessons.map((l) => ({
            ...l,
            id: (l as unknown as LessonEntity).lessonId,
          })),
          childrens: u.childrens.map((c) => ({
            ...c,
            id: (c as unknown as TrainingEntity).trainingId,
          })),
        })), // React-admin требует поле id
        total,
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Failed to load trainings');
    }
  }

  /**
   * GET ONE
   */
  async getOne(id: string | number) {
    // Преобразуем id в number
    const trainingId = typeof id === 'string' ? parseInt(id) : id;

    // Получаем тренинг
    const training = await this.contentService.populateTraining({ trainingId });

    if (!training) {
      throw new NotFoundException(`Тренинг с id=${training} не найден`);
    }

    // Возвращаем в формате React-Admin
    return {
      ...training,
      id: training.trainingId, // React-Admin требует поле id
      lessons: training.lessons.map((l) => ({
        ...l,
        id: (l as unknown as LessonEntity).lessonId,
      })),
      childrens: training.childrens.map((c) => ({
        ...c,
        id: (c as unknown as TrainingEntity).trainingId,
      })),
    };
  }

  /**
   * CREATE
   */
  async create(data: ContentAddTrainingRequestDto) {
    const created = await this.contentService.createTraining(data);

    if (!created) {
      throw new Error('Ошибка создания тренинга');
    }

    return {
      data: {
        ...created,
        id: created.trainingId,
      },
    };
  }

  /**
   * UPDATE
   */
  async update(id: string | number, data: Partial<TrainingEntity>) {
    const trainingId = typeof id === 'string' ? parseInt(id) : id;

    let training = await this.contentService.findTraining({ trainingId });

    if (!training) {
      throw new NotFoundException(`Тренинг с id=${trainingId} не найден`);
    }

    if (
      data.title ||
      data.description ||
      data.shortDescription ||
      data.duration ||
      data.coverUrl ||
      data.iconUrl ||
      data.bgUrl ||
      data.merchantId ||
      data.price ||
      data.salePrice ||
      data.stage ||
      data.stageLevel ||
      data.type ||
      data.tag ||
      data.favoritesTag
    ) {
      training = await this.contentService.updateTraining({ trainingId }, data);
    }

    return { id: trainingId, data: { ...training, id: trainingId } };
  }

  /**
   * DELETE
   */
  async delete(id: string | number) {
    const trainingId = typeof id === 'string' ? parseInt(id) : id;

    const deleted = await this.contentService.deleteTraining(trainingId);

    if (!deleted) {
      throw new Error('Ошибка удаления');
    }

    return { id: trainingId, data: { id: trainingId } };
  }
}
