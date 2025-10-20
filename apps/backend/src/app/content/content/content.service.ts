import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
  ITraining,
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
      const newTraining = new TrainingEntity({
        trainingId: await this.countersService.saveNextSequence(
          CounterType.TRAINING_ID
        ),
        ...dto,
      });

      const createdTraining = await this.trainingRepository.create(newTraining);

      if (dto.parentId) {
        const parentTraining = await this.trainingRepository.find({
          trainingId: dto.parentId,
        });

        this.trainingRepository.update(
          createdTraining.bindParent(parentTraining)
        );
        this.trainingRepository.update(
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
  ): Promise<TrainingEntity> {
    try {
      const training = await this.trainingRepository.find(condition);

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
      const trainingEntity = await this.trainingRepository.find({ trainingId });

      const trainingEntityPopulated =
        await this.trainingRepository.getNeighbors(trainingEntity);

      return trainingEntityPopulated;
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

    const createdLesson = await this.lessonRepository.create(newLesson);

    const training = await this.trainingRepository.find({
      trainingId: dto.parentId,
    });

    await this.trainingRepository.update(training.bindLesson(createdLesson));
    await this.lessonRepository.update(createdLesson.bindParent(training));

    return { lessonId: createdLesson.lessonId };
  }

  async findLesson(condition: FilterQuery<Lesson>): Promise<LessonEntity> {
    try {
      const lesson = await this.lessonRepository.find(condition);

      return lesson;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске урока';
      throw new InternalServerErrorException(message);
    }
  }
}
