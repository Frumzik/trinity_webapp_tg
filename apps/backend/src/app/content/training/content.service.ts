import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TrainingEntity } from './entities';
import { TrainingRepository } from './repositories';
import { FilterQuery } from 'mongoose';
import { Training } from './models';
import {
  ContentAddTrainingRequestDto,
  ContentAddTrainingResponseDto,
  CounterType,
} from '@trinity/shared';
import { CountersService } from '../../service';

@Injectable()
export class ContentService {
  constructor(
    private readonly trainingRepository: TrainingRepository,
    private readonly countersService: CountersService
  ) {}

  async createTraining(
    dto: ContentAddTrainingRequestDto
  ): Promise<ContentAddTrainingResponseDto> {
    try {
      // Создаем TrainingEntity
      const newTrainingEntity = new TrainingEntity({
        trainingId: await this.countersService.getNextSequence(
          CounterType.TRAINING_ID
        ),
        title: dto.title,
      });

      const trainingEntity = await this.trainingRepository.createTraining(
        newTrainingEntity
      );

      await this.countersService.saveNextSequence(CounterType.TRAINING_ID);

      return {
        trainingId: trainingEntity.trainingId,
      };
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
}
