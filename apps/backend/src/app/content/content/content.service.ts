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
  ContentAddLessonResponseDto,
  ContentAddTrainingRequestDto,
  ContentAddTrainingResponseDto,
  CounterType,
  ITraining,
} from '@trinity/shared';
import { CountersService } from '../../service';

@Injectable()
export class ContentService {
  constructor(
    private readonly trainingsRepository: TrainingsRepository,
    private readonly lessonsRepository: LessonsRepository,
    private readonly countersService: CountersService
  ) {}

  async createTraining(
    dto: ContentAddTrainingRequestDto
  ): Promise<ContentAddTrainingResponseDto> {
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

      return { trainingId: createdTraining.trainingId };
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

  async findStructureTraining({
    trainingId,
  }: {
    trainingId: number;
  }): Promise<ITraining> {
    try {
      const training = await this.trainingsRepository.find({ trainingId });

      if (!training) {
          throw new NotFoundException('Тренинг не найден');
        }

      const trainingPopulated = await this.trainingsRepository.getNeighbors(
        training
      );

      return trainingPopulated;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске тренинга';
      throw new InternalServerErrorException(message);
    }
  }

  async createLesson(
    dto: ContentAddLessonRequestDto
  ): Promise<ContentAddLessonResponseDto> {
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

    return { lessonId: createdLesson.lessonId };
  }

  async findLesson(condition: FilterQuery<Lesson>): Promise<LessonEntity | null> {
    try {
      const lesson = await this.lessonsRepository.find(condition);

      return lesson;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске урока';
      throw new InternalServerErrorException(message);
    }
  }
}
