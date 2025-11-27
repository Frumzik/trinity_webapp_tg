import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LessonEntity, TrainingEntity } from './entities';
import { LessonsRepository, TrainingsRepository } from './repositories';
import { FilterQuery } from 'mongoose';
import { Lesson, Training } from './models';
import {
  ContentAddLessonRequestDto,
  ContentAddTrainingRequestDto,
  ContentEvents,
  ContentLessonInfoResponseDto,
  ContentTrainingInfoResponseDto,
  CounterType,
  GetListOptions,
  ILesson,
  ITraining,
  LessonCreatedEvent,
  LessonDeletedEvent,
  TrainingCreatedEvent,
  TrainingDeletedEvent,
  TypeContentAccess,
} from '@trinity/shared';
import { CountersService } from '../../service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ContentService {
  constructor(
    private readonly trainingsRepository: TrainingsRepository,
    private readonly lessonsRepository: LessonsRepository,
    private readonly countersService: CountersService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  // Тренинги
  async createTraining(
    dto: ContentAddTrainingRequestDto
  ): Promise<ContentTrainingInfoResponseDto> {
    try {
      const newTraining = new TrainingEntity({
        trainingId: await this.countersService.saveNextSequence(
          CounterType.TRAINING_ID
        ),
        ...dto,
      });

      const createdTraining = await this.trainingsRepository.create(
        newTraining
      );

      if (dto.parentId) {
        const parentTraining = await this.trainingsRepository.find({
          trainingId: dto.parentId,
        });

        if (!parentTraining) {
          throw new NotFoundException('Родительский тренинг не найден');
        }

        this.trainingsRepository.update(
          createdTraining.bindParent(parentTraining)
        );
        this.trainingsRepository.update(
          parentTraining.bindChildren(createdTraining)
        );
      }

      this.eventEmitter.emit(
        ContentEvents.TRAINING_CREATED,
        new TrainingCreatedEvent(createdTraining.trainingId)
      );

      return createdTraining;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при создании тренинга';
      throw new InternalServerErrorException(message);
    }
  }

  async findTraining(
    condition: FilterQuery<Training>
  ): Promise<TrainingEntity | null> {
    try {
      const training = await this.trainingsRepository.find(condition);

      return training;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске тренинга';
      throw new InternalServerErrorException(message);
    }
  }

  async findAllTrainings(
    options?: GetListOptions<Training>
  ): Promise<TrainingEntity[]> {
    try {
      const trainings = await this.trainingsRepository.findAll(options);

      return trainings;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске тренинга';
      throw new InternalServerErrorException(message);
    }
  }

  async countTrainings(condition: FilterQuery<Training>): Promise<number> {
    try {
      const count = await this.trainingsRepository.count(condition);

      return count;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске тренинга';
      throw new InternalServerErrorException(message);
    }
  }

  async populateTraining(
    condition: FilterQuery<Training>
  ): Promise<TrainingEntity | null> {
    try {
      const trainingPopulated = await this.trainingsRepository.populate(
        condition
      );

      return trainingPopulated;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске тренинга';
      throw new InternalServerErrorException(message);
    }
  }

  async deleteTraining(trainingId: number): Promise<boolean> {
    const { deleted } = await this.trainingsRepository.delete({ trainingId });

    if (deleted) {
      this.eventEmitter.emit(
        ContentEvents.TRAINING_DELETED,
        new TrainingDeletedEvent(trainingId)
      );
    }

    return deleted;
  }

  async updateTrainingAccessRules(
    condition: FilterQuery<Training>,
    updateData: { accessRules: TypeContentAccess[] }
  ) {
    try {
      const training = await this.findTraining(condition);

      if (!training) {
        throw new NotFoundException('Тренинг не найден');
      }

      const updated = await this.trainingsRepository.update(
        training.updateAccessRules(updateData.accessRules)
      );

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске тренинга';
      throw new InternalServerErrorException(message);
    }
  }

  async updateTraining(
    condition: FilterQuery<Training>,
    updateData: Partial<
      Pick<ITraining, 'title' | 'description' | 'coverUrl' | 'price'>
    >
  ) {
    try {
      const training = await this.findTraining(condition);

      if (!training) {
        throw new NotFoundException('Тренинг не найден');
      }

      const updated = await this.trainingsRepository.update(
        training.update(updateData)
      );

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении тренинга';
      throw new InternalServerErrorException(message);
    }
  }

  // Уроки
  async createLesson(
    dto: ContentAddLessonRequestDto
  ): Promise<ContentLessonInfoResponseDto> {
    const newLesson = new LessonEntity({
      lessonId: await this.countersService.saveNextSequence(
        CounterType.LESSON_ID
      ),
      ...dto,
    });

    const createdLesson = await this.lessonsRepository.create(newLesson);

    const training = await this.trainingsRepository.find({
      trainingId: dto.parentId,
    });

    if (!training) {
      throw new NotFoundException('Родительский тренинг не найден');
    }

    await this.trainingsRepository.update(training.bindLesson(createdLesson));
    await this.lessonsRepository.update(createdLesson.bindParent(training));

    this.eventEmitter.emit(
      ContentEvents.LESSON_CREATED,
      new LessonCreatedEvent(createdLesson.lessonId, training.trainingId)
    );

    return createdLesson;
  }

  async findLesson(
    condition: FilterQuery<Lesson>
  ): Promise<LessonEntity | null> {
    try {
      const lesson = await this.lessonsRepository.find(condition);

      return lesson;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске урока';
      throw new InternalServerErrorException(message);
    }
  }

  async findAllLessons(
    options?: GetListOptions<Lesson>
  ): Promise<LessonEntity[]> {
    try {
      const lessons = await this.lessonsRepository.findAll(options);

      return lessons;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске тренинга';
      throw new InternalServerErrorException(message);
    }
  }

  async countLessons(condition: FilterQuery<Lesson>): Promise<number> {
    try {
      const count = await this.lessonsRepository.count(condition);

      return count;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске тренинга';
      throw new InternalServerErrorException(message);
    }
  }

  async populateLesson(
    condition: FilterQuery<Lesson>
  ): Promise<LessonEntity | null> {
    try {
      const lesssonPopulated = await this.lessonsRepository.populate(condition);

      return lesssonPopulated;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске урока';
      throw new InternalServerErrorException(message);
    }
  }

  async deleteLesson(lessonId: number): Promise<boolean> {
    // 1️⃣ Сначала находим урок, чтобы получить parentId
    const lesson = await this.lessonsRepository.find({ lessonId });
    if (!lesson) {
      throw new NotFoundException(`Урок с ID ${lessonId} не найден`);
    }

    const parentId = lesson.parentId;

    // 2️⃣ Потом удаляем
    const { deleted } = await this.lessonsRepository.delete({ lessonId });

    // 3️⃣ Если удалён — эмитим событие с parentId
    if (deleted) {
      this.eventEmitter.emit(
        ContentEvents.LESSON_DELETED,
        new LessonDeletedEvent(lessonId, parentId as number)
      );
    }

    return deleted;
  }

  async updateLessonAccessRules(
    condition: FilterQuery<Training>,
    updateData: { accessRules: TypeContentAccess[] }
  ) {
    try {
      const lesson = await this.findLesson(condition);

      if (!lesson) {
        throw new NotFoundException('Урок не найден');
      }

      const updated = await this.lessonsRepository.update(
        lesson.updateAccessRules(updateData.accessRules)
      );

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске урока';
      throw new InternalServerErrorException(message);
    }
  }

  async updateLesson(
    condition: FilterQuery<Lesson>,
    updateData: Partial<
      Pick<ILesson, 'title' | 'description' | 'coverUrl' | 'price' | 'content'>
    >
  ) {
    try {
      const lesson = await this.findLesson(condition);

      if (!lesson) {
        throw new NotFoundException('Урок не найден');
      }

      const updated = await this.lessonsRepository.update(
        lesson.update(updateData)
      );

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при обновлении урока';
      throw new InternalServerErrorException(message);
    }
  }
}
