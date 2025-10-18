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
        isRoot: !dto.parentId, // если нет parentId → корневой
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
}
