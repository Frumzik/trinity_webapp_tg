/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ContentAddLessonRequestDto, GetListOptions } from '@trinity/shared';
import { ContentService } from '../../lms';
import { Lesson } from '../../lms/content/models';
import { LessonEntity } from '../../lms/content/entities';

@Injectable()
export class AdminLessonService {
  constructor(private readonly contentService: ContentService) {}
  /**
   * LIST: фильтры + сортировка + пагинация
   */
  async getList(params: GetListOptions<Lesson>) {
    try {
      // Параметры для findAll
      const options = {
        ...params,
        populate: [], // если нужно populate
      };

      const items = await this.contentService.findAllLessons(options);
      const total = await this.contentService.countLessons();

      return {
        items: items.map((u) => ({
          ...u,
          id: u.lessonId,
        })), // React-admin требует поле id
        total,
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Failed to load lessons');
    }
  }

  /**
   * GET ONE
   */
  async getOne(id: string | number) {
    // Преобразуем id в number
    const lessonId = typeof id === 'string' ? parseInt(id) : id;

    // Получаем тренинг
    const lesson = await this.contentService.populateLesson({ lessonId });

    if (!lesson) {
      throw new NotFoundException(`Урок с id=${lesson} не найден`);
    }

    // Возвращаем в формате React-Admin
    return {
      ...lesson,
      id: lesson.lessonId, // React-Admin требует поле id
    };
  }

  /**
   * CREATE
   */
  async create(data: ContentAddLessonRequestDto) {
    const created = await this.contentService.createLesson(data);

    if (!created) {
      throw new Error('Ошибка создания урока');
    }

    return {
      data: {
        ...created,
        id: created.lessonId,
      },
      id: created.lessonId,
    };
  }

  /**
   * UPDATE
   */
  async update(id: string | number, data: Partial<LessonEntity>) {
    const lessonId = typeof id === 'string' ? parseInt(id) : id;

    let lesson = await this.contentService.findLesson({ lessonId });

    if (!lesson) {
      throw new NotFoundException(`Урок с id=${lessonId} не найден`);
    }

    if (
      data.title !== undefined ||
      data.description !== undefined ||
      data.shortDescription !== undefined ||
      data.duration !== undefined ||
      data.coverUrl !== undefined ||
      data.iconUrl !== undefined ||
      data.bgUrl !== undefined ||
      data.price !== undefined ||
      data.salePrice !== undefined ||
      data.type !== undefined ||
      data.content !== undefined ||
      data.favoritesTag !== undefined
    ) {
      lesson = await this.contentService.updateLesson({ lessonId }, data);
    }

    lesson = await this.contentService.updateLesson({ lessonId }, data);

    return { id: lessonId, data: { ...lesson, id: lessonId } };
  }

  /**
   * DELETE
   */
  async delete(id: string | number) {
    const lessonId = typeof id === 'string' ? parseInt(id) : id;

    const deleted = await this.contentService.deleteLesson(lessonId);

    if (!deleted) {
      throw new Error('Ошибка удаления');
    }

    return { id: lessonId, data: { id: lessonId } };
  }
}
