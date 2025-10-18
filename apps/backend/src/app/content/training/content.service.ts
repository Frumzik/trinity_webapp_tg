import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LessonEntity, TrainingEntity } from './entities';
import { LessonRepository, TrainingRepository } from './repositories';
import { FilterQuery } from 'mongoose';
import { Lesson, Training } from './models';
import {
  ContentAddLessonRequestDto,
  ContentAddLessonResponseDto,
  ContentAddTrainingRequestDto,
  ContentAddTrainingResponseDto,
  CounterType,
} from '@trinity/shared';
import { CountersService } from '../../service';

@Injectable()
export class ContentService {
  constructor(
    private readonly trainingRepository: TrainingRepository,
    private readonly countersService: CountersService,
    private readonly lessonRepository: LessonRepository
  ) {}

  async createTraining(
    dto: ContentAddTrainingRequestDto
  ): Promise<ContentAddTrainingResponseDto> {
    try {
      // 1️⃣ Получаем новый ID
      const newTrainingId = await this.countersService.saveNextSequence(
        CounterType.TRAINING_ID
      );

      // 2️⃣ Создаём сущность
      const newTrainingEntity = new TrainingEntity({
        trainingId: newTrainingId,
        title: dto.title,
        description: dto.description,
        parentId: dto.parentId || null,
        isRoot: !dto.parentId, // если нет parentId → корневой,
        lessonsId: [],
        childrensId: [],
      });

      // 3️⃣ Сохраняем в базу
      const createdTraining = await this.trainingRepository.createTraining(
        newTrainingEntity
      );

      // 5️⃣ Если указан parentId — связываем
      await this.trainingRepository.bindParentAndChild(
        dto.parentId || null,
        createdTraining.trainingId
      );

      return { trainingId: createdTraining.trainingId };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при создании тренинга';
      throw new InternalServerErrorException(message);
    }
  }

  async findTraining(
    condition: FilterQuery<Training>
  ): Promise<TrainingEntity> {
    try {
      const training = await this.trainingRepository.findTraining(condition);
      if (!training) {
        throw new NotFoundException('Тренинг не найден');
      }
      return training;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске тренинга';
      throw new InternalServerErrorException(message);
    }
  }

  async findStructureTraining({
    trainingId,
  }: {
    trainingId: number;
  }): Promise<TrainingEntity> {
    try {
      const training = await this.trainingRepository.getFullStructure(
        trainingId
      );
      if (!training) {
        throw new NotFoundException('Тренинг не найден');
      }
      return training;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске тренинга';
      throw new InternalServerErrorException(message);
    }
  }

  async createLesson(
    dto: ContentAddLessonRequestDto
  ): Promise<ContentAddLessonResponseDto> {
    const lessonId = await this.countersService.getNextSequence(
      CounterType.LESSON_ID
    );

    const newLesson = new LessonEntity({
      lessonId,
      title: dto.title,
      description: dto.description,
      parentId: dto.parentId,
    });

    const created = await this.lessonRepository.createLesson(newLesson);

    await this.countersService.saveNextSequence(CounterType.LESSON_ID);

    // ✅ Привязываем, если parentTrainingId указан
    await this.lessonRepository.bindTraining(created.lessonId, dto.parentId);

    // ✅ Привязываем, если parentTrainingId указан
    await this.trainingRepository.bindLesson(dto.parentId, created.lessonId);

    return { lessonId: created.lessonId };
  }

  async findLesson(condition: FilterQuery<Lesson>): Promise<LessonEntity> {
    try {
      const lesson = await this.lessonRepository.findLesson(condition);
      if (!lesson) {
        throw new NotFoundException('Урок не найден');
      }
      return lesson;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске урока';
      throw new InternalServerErrorException(message);
    }
  }
}
